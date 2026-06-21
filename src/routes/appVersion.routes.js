import express from "express";
import {
  updateOrAddAppSettings,
  getAllAppVersion,
} from "../controllers/admin/appVersion.controllers.js";
import { validateRequest } from "../middlewares/zodValidate.middleware.js";
import { updateAppVersionValidator } from "../validators/appVersion.validator.js";

const router = express.Router();

router.patch(
  "/:platform",
  validateRequest(updateAppVersionValidator),
  updateOrAddAppSettings
);
router.get("/", getAllAppVersion);

export default router;
