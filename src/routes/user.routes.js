import { Router } from "express";
import passport from "passport";
import { UserRolesEnum } from "../constants.js";
import {
  userLoginValidator,
  userRegisterValidator,
} from "../validators/user/user.validators.js";
import { validate } from "../validators/validate.js";
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

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/profile").get(verifyJWT, getProfile);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/sessions").get(verifyJWT, listSessions);
router.route("/logout-all").post(verifyJWT, logoutAllSessions);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

router.route("/simulate").post(verifyJWT, simulateNotification);
router.route("/testing-app-setting").get(testingAppSetting);

export default router;
