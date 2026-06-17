import { Session } from "../models/session.models.js";

class SessionService {
  static createSession = async ({
    userId,
    jti,
    tokenHash,
    deviceId,
    ip,
    userAgent,
    expiresAt,
  }) => {
    const session = new Session({
      user: userId,
      jti,
      tokenHash,
      deviceId,
      ip,
      userAgent,
      expiresAt,
    });
    return await session.save();
  };

  static findByJti = async (jti) => {
    return await Session.findOne({ jti });
  };

  static updateSessionById = async (sessionId, updatedFields) => {
    return await Session.findByIdAndUpdate(sessionId, { ...updatedFields });
  };

  static revokeSessionById = async (sessionId) => {
    return await Session.findByIdAndUpdate(sessionId, { revoked: true });
  };

  static revokeAllForUser = async (userId) => {
    return await Session.updateMany({ user: userId }, { revoked: true });
  };

  static listSessionsForUser = async (userId) => {
    return await Session.find({ user: userId, revoked: false }).select(
      "-tokenHash -__v"
    );
  };
}

export default SessionService;
