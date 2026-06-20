import semver from "semver";
import { ApiError } from "../utils/ApiError.js";
import AppVersionService from "../db/services/appVersion.services.js";

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
      const err = new ApiError(503, "Service under maintenance");
      err.code = "MAINTENANCE";
      err.data = {
        maintenance: true,
        message: "Service temporarily unavailable",
      };
      throw err;
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
      const err = new ApiError(426, "Please upgrade your app to continue");
      err.code = "FORCE_UPDATE";
      err.data = {
        version: cfg.version,
        forceUpdate: cfg.forceUpdate,
      };
      throw err;
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

export default versionMiddleware;
