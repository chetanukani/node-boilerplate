import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  simulateNotification,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logoutAllSessions,
  listSessions,
  testingAppSetting,
} from "../controllers/user/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { validateRequest } from "../middlewares/zodValidate.middleware.js";
import {
  userLoginValidator,
  userRegisterValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/user.validator.js";

const router = Router();

router
  .route("/register")
  .post(validateRequest(userRegisterValidator), registerUser);
router.route("/login").post(validateRequest(userLoginValidator), loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/profile").get(verifyJWT, getProfile);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/sessions").get(verifyJWT, listSessions);
router.route("/logout-all").post(verifyJWT, logoutAllSessions);
router
  .route("/forgot-password")
  .post(validateRequest(forgotPasswordValidator), forgotPassword);
router
  .route("/reset-password")
  .post(validateRequest(resetPasswordValidator), resetPassword);

router.route("/simulate").post(verifyJWT, simulateNotification);
router.route("/testing-app-setting").get(testingAppSetting);

export default router;
