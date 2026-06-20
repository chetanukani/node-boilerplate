import express from "express";
import { appVersionRequestBodyValidator } from "../validators/appVersion.validators.js";
import {
  updateOrAddAppSettings,
  getAllAppVersion,
} from "../controllers/appVersion.controllers.js";
import { validate } from "../validators/validate.js";

const router = express.Router();

// Create or update config for a platform (single endpoint)
router.patch(
  "/:platform",
  appVersionRequestBodyValidator(),
  validate,
  updateOrAddAppSettings
);
router.get("/", getAllAppVersion);

export default router;
