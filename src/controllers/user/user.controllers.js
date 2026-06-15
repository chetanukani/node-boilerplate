import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  ResponseMessages,
  TableFields,
  UserLoginType,
  UserRolesEnum,
  ValidationMessages,
} from "../../constants.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import UserService from "../../db/services/user.services.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await UserService.findUserById(userId).withId().execute();
    if (!user) {
      throw new ApiError(400, ValidationMessages.RecordNotFound);
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await UserService.updateUser({ refreshToken });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, ValidationMessages.SomethingWentWrong);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const existedUser = await UserService.findUserByUserNameOrEmail({
    $or: [{ username }, { email }],
  })
    .withId()
    .execute();

  if (existedUser) {
    throw new ApiError(409, ValidationMessages.UserAlreadyExist, []);
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

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, { user: createdUser }, ResponseMessages.CREATED)
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, ValidationMessages.SomethingWentWrong);
  }

  const user = await UserService.findUserByUserNameOrEmail({
    $or: [{ username }, { email }],
  })
    .withId()
    .execute();

  if (!user) {
    throw new ApiError(404, ValidationMessages.RecordNotFound);
  }

  console.log("user", user);

  // Compare the incoming password with hashed password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, ValidationMessages.InvalidCredentials);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user[TableFields.ID]
  );

  // get the user document ignoring the password and refreshToken field
  const loggedInUser = await UserService.findUserById(user[TableFields.ID])
    .withBasicInfo()
    .execute();

  // TODO: Add more options to make cookie more secure and reliable
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await UserService.updateUser(req.user[TableFields.ID], {
    $set: {
      refreshToken: "",
    },
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user[TableFields.ID];
  const userData = await UserService.findUserById(userId)
    .withBasicInfo()
    .execute();
  return res
    .status(200)
    .json(new ApiResponse(200, userData, "Profile fetched successful"));
});

export { registerUser, loginUser, logoutUser, getProfile };
