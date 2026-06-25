import crypto from "crypto";
import Util from "../../utils/util.js";
import jwt from "jsonwebtoken";
import {
  ResponseMessages,
  TableFields,
  UserRolesEnum,
  ValidationMessages,
} from "../../constants.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/asyncHandler.js";
import UserService from "../../db/services/user.services.js";
import SessionService from "../../db/services/session.services.js";
import NotificationService from "../../db/services/notification/notification.services.js";
import { sendEmail, forgotPasswordMailgenContent } from "../../utils/mail.js";
import { env } from "../../config/index.js";
import { emitSocketEvent } from "../../socket/index.js";

// prefer shared util functions
const hashToken = (token) => Util.hashToken(token);

const createTokensAndSession = async ({ userId, deviceId, ip, userAgent }) => {
  try {
    const user = await UserService.findUserById(userId)
      .withId()
      .withAuthTokens()
      .execute();
    if (!user)
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        ValidationMessages.RecordNotFound
      );

    const accessToken = user.generateAccessToken();

    // create refresh token with jti
    const jti = Util.generateJti();
    const refreshToken = jwt.sign(
      { _id: userId, jti },
      env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: env.REFRESH_TOKEN_EXPIRY,
      }
    );

    const tokenHash = hashToken(refreshToken);

    // compute expiresAt (fallback to 30 days if not provided as ms env var)
    const expiresMs = env.REFRESH_TOKEN_EXPIRY_MS ?? 30 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + expiresMs);

    await SessionService.createSession({
      userId,
      jti,
      tokenHash,
      deviceId,
      ip,
      userAgent,
      expiresAt,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ValidationMessages.SomethingWentWrong
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.validated.body;

  const existedUser = await UserService.findUserByEmail(email)
    .withId()
    .execute();

  if (existedUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      ValidationMessages.UserAlreadyExist,
      []
    );
  }

  const user = await UserService.addUser({
    email,
    password,
    username,
    isEmailVerified: false,
    role: UserRolesEnum.USER,
  });

  const createdUser = await UserService.findUserById(user[TableFields.ID])
    .withBasicInfo()
    .execute();

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        { user: createdUser },
        ResponseMessages.CREATED
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  const user = await UserService.findUserByEmail(email)
    .withId()
    .withPassword()
    .execute();

  if (!user) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      ValidationMessages.InvalidCredentials
    );
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      ValidationMessages.InvalidCredentials
    );
  }

  const deviceId = req.body.deviceId || req.headers["x-device-id"];
  const ip = req.ip || req.headers["x-forwarded-for"];
  const userAgent = req.get("User-Agent") || "";

  const { accessToken, refreshToken } = await createTokensAndSession({
    userId: user[TableFields.ID],
    deviceId,
    ip,
    userAgent,
  });

  // get the user document ignoring the password and refreshToken field
  const loggedInUser = await UserService.findUserById(user[TableFields.ID])
    .withBasicInfo()
    .execute();

  // Cookie options: keep refresh token HttpOnly and Secure in production
  const options = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "None" : "Lax",
  };

  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, options) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
    .json(
      new ApiResponse(
        StatusCodes.OK,
        { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
        ResponseMessages.LoginSuccess
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      ValidationMessages.UnAuthorized
    );

  let decoded;
  try {
    decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      ValidationMessages.UnAuthorized
    );
  }

  const { _id: userId, jti } = decoded;
  const session = await SessionService.findByJti(jti);
  if (!session || session.revoked || String(session.user) !== String(userId)) {
    // possible reuse or invalid token
    await SessionService.revokeAllForUser(userId);
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      ValidationMessages.UnAuthorized
    );
  }

  const currentHash = hashToken(token);
  if (currentHash !== session.tokenHash) {
    // token reuse detected
    await SessionService.revokeAllForUser(userId);
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      ValidationMessages.UnAuthorized
    );
  }

  // rotate: issue new refresh token and access token, update session
  const deviceId = session.deviceId;
  const ip = session.ip;
  const userAgent = session.userAgent;

  const user = await UserService.findUserById(userId).withId().execute();
  if (!user)
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      ValidationMessages.UnAuthorized
    );

  const newJti = Util.generateJti();
  const newRefreshToken = jwt.sign(
    { _id: userId, jti: newJti },
    env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRY,
    }
  );
  const newTokenHash = hashToken(newRefreshToken);

  // update session with new jti and hash
  await SessionService.updateSessionById(session._id, {
    jti: newJti,
    tokenHash: newTokenHash,
  });

  const accessToken = user.generateAccessToken();

  const options = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "None" : "Lax",
  };

  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        { accessToken, refreshToken: newRefreshToken },
        "Tokens refreshed"
      )
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.validated.body;

  const user = await UserService.findUserByUserNameOrEmail({ email })
    .withId()
    .withBasicInfo()
    .execute();

  // Always respond with success to avoid user enumeration
  if (!user) {
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          {},
          ResponseMessages.PasswordResetEmailSent
        )
      );
  }

  // generate temporary token using model helper
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  await UserService.updateUser(user._id, {
    $set: {
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiry: new Date(tokenExpiry),
    },
  });

  const resetUrlBase = env.FRONTEND_URL || env.HOST_URL;
  const passwordResetUrl = `${resetUrlBase}/reset-password?token=${unHashedToken}`;

  // send email (failure to send email shouldn't block response)
  sendEmail({
    email: user.email,
    subject: "Password reset instructions",
    mailgenContent: forgotPasswordMailgenContent(
      user.username || user.email,
      passwordResetUrl
    ),
  });

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        {},
        ResponseMessages.PasswordResetEmailSent
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.validated.body;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await UserService.findByForgotToken(tokenHash)
    .withId()
    .withPassword()
    .execute();

  if (!user) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      ValidationMessages.InvalidAurTokenExpired
    );
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();

  // revoke all sessions after password change
  await SessionService.revokeAllForUser(user._id);

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, {}, ResponseMessages.PasswordResetSuccess)
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // try to revoke the session identified by the refresh token present in cookie
  const token =
    req.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET);
      const session = await SessionService.findByJti(decoded.jti);
      if (session) await SessionService.revokeSessionById(session._id);
    } catch (err) {
      // ignore - still clear cookies
    }
  }

  const options = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
  };

  return res
    .status(StatusCodes.OK)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(StatusCodes.OK, {}, "User logged out"));
});

const logoutAllSessions = asyncHandler(async (req, res) => {
  const userId = req.user?.[TableFields.ID];
  if (!userId)
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      ValidationMessages.UnAuthorized
    );

  await SessionService.revokeAllForUser(userId);

  const options = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
  };
  return res
    .status(StatusCodes.OK)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(StatusCodes.OK, {}, "All sessions revoked"));
});

const listSessions = asyncHandler(async (req, res) => {
  const userId = req.user?.[TableFields.ID];
  if (!userId)
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      ValidationMessages.UnAuthorized
    );

  const sessions = await SessionService.listSessionsForUser(userId);
  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, sessions, "Active sessions fetched"));
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user[TableFields.ID];
  const userData = await UserService.findUserById(userId)
    .withBasicInfo()
    .execute();
  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        userData,
        ResponseMessages.ProfileFetchSuccess
      )
    );
});

/**
 * Simulate sending a notification to a user (for testing)
 * Body: { userId?: string, notification?: {title, body}, data?: object }
 */
const simulateNotification = asyncHandler(async (req, res) => {
  const userId = req.user?.[TableFields.ID];
  if (!userId)
    throw new ApiError(StatusCodes.BAD_REQUEST, "userId is required");

  await NotificationService.sendNotificationToUserById(userId);

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, {}, "Notification simulated"));
});

const testingAppSetting = asyncHandler(async (req, res, next) => {
  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, {}, "App setting tested"));
});

const testingSocketEmit = asyncHandler(async (req, res, next) => {
  emitSocketEvent(req, "101", "testing", { message: "This is testing" });
  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, {}, "Socket emit event tested"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  refreshAccessToken,
  logoutAllSessions,
  listSessions,
  forgotPassword,
  resetPassword,
  simulateNotification,
  testingAppSetting,
  testingSocketEmit,
};
