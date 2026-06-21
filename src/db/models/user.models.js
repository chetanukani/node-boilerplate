import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import {
  AvailableSocialLogins,
  AvailableUserRoles,
  USER_TEMPORARY_TOKEN_EXPIRY,
  UserLoginType,
  UserRolesEnum,
  TableFields,
  TableNames,
  ValidationMessages,
  PlatformType,
} from "../../constants.js";

const userSchema = new Schema(
  {
    [TableFields.avatar]: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://via.placeholder.com/200x200.png`,
        localPath: "",
      },
    },
    [TableFields.username]: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    [TableFields.email]: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    [TableFields.role]: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.USER,
      required: true,
    },
    [TableFields.password]: {
      type: String,
      required: [true, ValidationMessages.PasswordRequired],
    },
    [TableFields.loginType]: {
      type: String,
      enum: AvailableSocialLogins,
      default: UserLoginType.EMAIL_PASSWORD,
    },
    [TableFields.isEmailVerified]: {
      type: Boolean,
      default: false,
    },
    [TableFields.refreshToken]: {
      type: String,
    },
    [TableFields.forgotPasswordToken]: {
      type: String,
    },
    [TableFields.forgotPasswordExpiry]: {
      type: Date,
    },
    [TableFields.emailVerificationToken]: {
      type: String,
    },
    [TableFields.emailVerificationExpiry]: {
      type: Date,
    },
    [TableFields.fcmTokens]: [
      {
        _id: false,
        [TableFields.token]: String,
        [TableFields.platform]: {
          type: String,
          enum: Object.values(PlatformType),
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret[TableFields.emailVerificationToken];
        delete ret[TableFields.forgotPasswordToken];
        delete ret[TableFields.password];
        delete ret[TableFields.refreshToken];
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * @description Method responsible for generating tokens for email verification, password reset etc.
 */
userSchema.methods.generateTemporaryToken = function () {
  // This token should be client facing
  // for example: for email verification unHashedToken should go into the user's mail
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  // This should stay in the DB to compare at the time of verification
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  // This is the expiry time for the token (20 minutes)
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  return { unHashedToken, hashedToken, tokenExpiry };
};

/**
 * Add or update a device token for multi-device push notifications
 * @param {{token: string, deviceId?: string, platform?: string}} tokenObj
 */
userSchema.methods.addDeviceToken = async function (tokenObj) {
  if (!tokenObj?.token) return this;

  const tokens = this[TableFields.fcmTokens] || [];
  const existingIndex = tokens.findIndex(
    (entry) => entry.token === tokenObj.token
  );
  const nextEntry = {
    [TableFields.token]: tokenObj.token,
    [TableFields.platform]: tokenObj.platform || PlatformType.Android,
  };

  if (existingIndex > -1) {
    tokens[existingIndex] = nextEntry;
  } else {
    tokens.push(nextEntry);
  }

  this[TableFields.fcmTokens] = tokens;
  return this.save();
};

userSchema.methods.removeDeviceToken = async function (token) {
  if (!token) return this;

  this[TableFields.fcmTokens] = (this[TableFields.fcmTokens] || []).filter(
    (entry) => entry.token !== token
  );
  return this.save();
};

export const User = mongoose.model(TableNames.User, userSchema);
