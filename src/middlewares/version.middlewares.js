import semver from "semver";
import { ApiError } from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import AppVersionService from "../db/services/appVersion.services.js";
import { ValidationMessages } from "../constants.js";

async function versionMiddleware(req, res, next) {
  // Read common headers set by mobile apps
  const headerPlatform = (req.headers["x-app-platform"] || "")
    .toString()
    .toLowerCase();

  const headerVersion = (req.headers["x-app-version"] || "").toString().trim();

  // If headers not provided, skip version checks
  if (!headerPlatform || !headerVersion) return next();

  try {
    const cfg = await AppVersionService.getConfig(headerPlatform);
    if (!cfg) return next();

    if (cfg.maintenance) {
      throw new ApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        ValidationMessages.UnderMaintenance
      );
    }
    const appVer = semver.coerce(headerVersion);
    const serverVer = cfg.version ? semver.coerce(cfg.version) : null;

    if (!appVer) return next();

    // If server in maintenance mode above checked.
    // If client's version is >= server `version` -> allow regardless of forceUpdate flag
    if (serverVer && semver.gte(appVer, serverVer)) {
      res.setHeader("x-server-app-version", cfg.version);
      return next();
    }

    // If client's version is lower than server version and forceUpdate is true -> force update
    if (serverVer && semver.lt(appVer, serverVer) && cfg.forceUpdate) {
      throw new ApiError(
        StatusCodes.UPGRADE_REQUIRED,
        ValidationMessages.ForceUpdate
      );
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

export default versionMiddleware;
