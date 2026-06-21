import { env } from "../../config/index.js";
import Util from "../../utils/util.js";
import { AppVersion } from "../models/appVersion.models.js";

const cache = new Map();
const TTL_SECONDS = env.APP_VERSION_CACHE_TTL_SECONDS;

async function getConfig(platform) {
  if (!platform) return null;
  const key = platform.toString().toLowerCase();
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) return cached.value;

  const result = await AppVersion.findOne({ platform: key }).lean();

  cache.set(key, { value: result, expiresAt: now + TTL_SECONDS * 1000 });
  return result;
}

async function getAllPlatformConfig() {
  return await AppVersion.find();
}

function invalidate(platform) {
  if (!platform) return;
  cache.delete(platform.toString().toLowerCase());
}

async function updateOrAddAppSettings(platform, payload) {
  if (!platform || !payload) return null;
  const key = platform.toString().toLowerCase();

  const values = {
    platform: key,
    version: payload.version || "0.0.0",
    forceUpdate: Util.parseBoolean(payload.forceUpdate),
    maintenance: Util.parseBoolean(payload.maintenance),
  };
  const doc = await AppVersion.findOneAndUpdate({ platform: key }, values, {
    upsert: true,
    returnDocument: "after",
    setDefaultsOnInsert: true,
  });
  invalidate(key);
  return doc;
}

export default {
  getConfig,
  invalidate,
  updateOrAddAppSettings,
  getAllPlatformConfig,
};
