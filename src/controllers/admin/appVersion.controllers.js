import { ResponseMessages } from "../../constants.js";
import AppVersionService from "../../db/services/appVersion.services.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";

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
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, doc, ResponseMessages.UPDATED));
  } catch (err) {
    return next(err);
  }
}

async function getAllAppVersion(req, res, next) {
  const records = await AppVersionService.getAllPlatformConfig();
  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { records }, "Fetched"));
}

export { updateOrAddAppSettings, getAllAppVersion };
