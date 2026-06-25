import { Router } from "express";
import { validateRequest } from "../middlewares/zodValidate.middleware.js";
import {
  upsertCmsPage,
  getCmsPage,
} from "../controllers/admin/cmsPage.controllers.js";
import {
  getCmsPageValidator,
  upsertCmsPageValidator,
} from "../validators/cmsPage.validator.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  getAllAppVersion,
  updateOrAddAppSettings,
} from "../controllers/admin/appVersion.controllers.js";
import { updateAppVersionValidator } from "../validators/appVersion.validator.js";

const router = Router();

router
  .route("/cms-pages/:slug")
  .get(validateRequest(getCmsPageValidator), getCmsPage)
  .put(verifyJWT, validateRequest(upsertCmsPageValidator), upsertCmsPage);

router.patch(
  "/app-versions/:platform",
  validateRequest(updateAppVersionValidator),
  updateOrAddAppSettings
);
router.get("/app-versions", getAllAppVersion);

export default router;
