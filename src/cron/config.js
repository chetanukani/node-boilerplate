import cleanupExpiredSessionsJob from "./jobs/cleanupExpiredSessions.job.js";

/**
 * @typedef {object} CronJobConfig
 * @property {string} name - Unique job identifier (used in logs)
 * @property {string} schedule - Cron expression (validated at startup)
 * @property {boolean} enabled - Whether this job should be scheduled
 * @property {() => Promise<void>} run - Async job handler
 */

/**
 * @param {import("../config/index.js").env} env
 * @returns {CronJobConfig[]}
 */
export const getCronJobs = (env) => [
  {
    name: "cleanup-expired-sessions",
    schedule: "* * * * *",
    enabled: true,
    run: cleanupExpiredSessionsJob,
  },
];
