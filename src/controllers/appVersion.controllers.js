import AppVersionService from "../db/services/appVersion.services.js";
import { ApiResponse } from "../utils/ApiResponse.js";

async function updateOrAddAppSettings(req, res, next) {
  try {
    // `platform` path param is validated by the route's validators + `validate` middleware
    const platform = req.params.platform.toString().toLowerCase();

    const payload = {
      version: req.body.version,
      forceUpdate: req.body.forceUpdate,
      maintenance: req.body.maintenance,
    };

    const doc = await AppVersionService.updateOrAddAppSettings(
      platform,
      payload
    );
    return res
      .status(200)
      .json(new ApiResponse(200, doc, "App version upserted"));
  } catch (err) {
    return next(err);
  }
}

async function getAllAppVersion(req, res, next) {
  const records = await AppVersionService.getAllPlatformConfig();
  return res.status(200).json(new ApiResponse(200, { records }, "Fetched"));
}

export { updateOrAddAppSettings, getAllAppVersion };
