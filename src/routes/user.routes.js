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
  userLoginSchema,
  userRegisterSchema,
} from "../schemas/user.schemas.js";

const router = Router();

router
  .route("/register")
  .post(validateRequest(userRegisterSchema), registerUser);
router.route("/login").post(validateRequest(userLoginSchema), loginUser);

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
