/**
 * @type {{ ADMIN: "ADMIN"; USER: "USER"} as const}
 */
export const UserRolesEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes

export const MAXIMUM_SUB_IMAGE_COUNT = 4;
export const MAXIMUM_SOCIAL_POST_IMAGE_COUNT = 6;
export const MAXIMUM_BULK_PRODUCT_COUNT = 50;

/**
 * @description set of events that we are using in chat app. more to be added as we develop the chat app
 */
export const ChatEventEnum = Object.freeze({
  // ? once user is ready to go
  CONNECTED_EVENT: "connected",
  // ? when user gets disconnected
  DISCONNECT_EVENT: "disconnect",
  // ? when user joins a socket room
  JOIN_CHAT_EVENT: "joinChat",
  // ? when participant gets removed from group, chat gets deleted or leaves a group
  LEAVE_CHAT_EVENT: "leaveChat",
  // ? when admin updates a group name
  UPDATE_GROUP_NAME_EVENT: "updateGroupName",
  // ? when new message is received
  MESSAGE_RECEIVED_EVENT: "messageReceived",
  // ? when there is new one on one chat, new group chat or user gets added in the group
  NEW_CHAT_EVENT: "newChat",
  // ? when there is an error in socket
  SOCKET_ERROR_EVENT: "socketError",
  // ? when participant stops typing
  STOP_TYPING_EVENT: "stopTyping",
  // ? when participant starts typing
  TYPING_EVENT: "typing",
  // ? when message is deleted
  MESSAGE_DELETE_EVENT: "messageDeleted",
});

export const AvailableChatEvents = Object.values(ChatEventEnum);

/** MongoDB collection names */
export const TableNames = {
  User: "users",
  Category: "categories",
  Product: "products",
  Notification: "notifications",
  Session: "sessions",
  CMSPages: "cms_pages",
};

/**
 * Field keys used across models, services, and queries.
 * Add new fields here when introducing a model or projection.
 */
export const TableFields = {
  // Common
  ID: "_id",
  createdAt: "createdAt",
  updatedAt: "updatedAt",

  // User
  username: "username",
  email: "email",
  role: "role",
  password: "password",
  isEmailVerified: "isEmailVerified",
  refreshToken: "refreshToken",
  forgotPasswordToken: "forgotPasswordToken",
  forgotPasswordExpiry: "forgotPasswordExpiry",
  emailVerificationToken: "emailVerificationToken",
  emailVerificationExpiry: "emailVerificationExpiry",
  deviceTokens: "deviceTokens",
  url: "url",
  localPath: "localPath",
  name_: "name",
  category: "category",
  description: "description",
  mainImage: "mainImage",
  media: "media",
  price: "price",
  stock: "stock",
  subImages: "subImages",
  user: "user",
  title: "title",
  message: "message",
  type: "type",
  metadata: "metadata",
  fcmTokens: "fcmTokens",
  token: "token",
  platform: "platform",
  image: "image",
  mediaType: "mediaType",
};

/** Shared validation / error messages */
export const ValidationMessages = {
  RecordNotFound: "Record not found",
  UserAlreadyExist: "User with email or username already exists",
  SomethingWentWrong: "Something went wrong",
  InvalidData: "Received data is not valid",
  InvalidCredentials: "Invalid user credentials",
  UnAuthorized: "Unauthorized request",
  NotAllowed: "You are not allowed to perform this action",
  ImageRequired: "Main image is required",
  ProductsRequired: "At least one product is required",
  InvalidProductsJson: "products must be a valid JSON array",
  BulkProductLimitExceeded: "Bulk product limit exceeded",
  ProductMediaRequired: "Media is required for each product",
  InvalidAurTokenExpired: "Invalid or expired password reset token",
  PasswordRequired: "Password is required",
  DevOnlyService: "This service is only available in the local environment",
  StripeNotEnabled: "Stripe payments are not enabled",
};

/** Shared success response messages */
export const ResponseMessages = {
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",
  FETCHED: "Fetched successfully",
  LoginSuccess: "User logged in successfully",
  ProfileFetchSuccess: "Profile fetched successful",
  ProductCreatedSuccess: "Product created successfully",
  MediaUploadSuccess: "Media uploaded successfully",
  ProductsBulkCreatedSuccess: "Products created successfully",
  PasswordResetEmailSent:
    "If an account exists, password reset instructions have been sent.",
  PasswordResetSuccess: "Password has been reset successfully",
};

export const PlatformType = {
  Android: "android",
  iOS: "ios",
};

export const MediaTypes = {
  Image: 1,
  Audio: 2,
  Video: 3,
  Pdf: 4,
  Excel: 5,
  Doc: 6,
};
