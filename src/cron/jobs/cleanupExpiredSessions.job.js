import { Session } from "../../db/models/session.models.js";

const cleanupExpiredSessionsJob = async () => {
  const result = await Session.deleteMany({
    expiresAt: { $lt: new Date() },
  });

  if (result.deletedCount > 0) {
    console.log(
      `[cron:cleanup-expired-sessions] removed ${result.deletedCount} expired session(s)`
    );
  }
};

export default cleanupExpiredSessionsJob;
