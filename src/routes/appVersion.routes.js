import express from "express";
import {
  updateOrAddAppSettings,
  getAllAppVersion,
} from "../controllers/admin/appVersion.controllers.js";
import { validateRequest } from "../middlewares/zodValidate.middleware.js";
import { updateAppVersionSchema } from "../schemas/appVersion.schemas.js";

const router = express.Router();

router.patch(
  "/:platform",
  validateRequest(updateAppVersionSchema),
  updateOrAddAppSettings
);
router.get("/", getAllAppVersion);

export default router;
