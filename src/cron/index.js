import cron from "node-cron";
import { env } from "../config/index.js";
import { getCronJobs } from "./config.js";

/** @type {Map<string, import("node-cron").ScheduledTask>} */
const scheduledTasks = new Map();

export const initializeCronJobs = () => {
  if (!env.ENABLE_CRON) {
    return;
  }

  const jobs = getCronJobs(env);

  for (const job of jobs) {
    if (!job.enabled) {
      console.log(`Cron job "${job.name}" is disabled`);
      continue;
    }

    if (!cron.validate(job.schedule)) {
      console.error(`Invalid cron schedule for "${job.name}": ${job.schedule}`);
      continue;
    }

    const task = cron.schedule(
      job.schedule,
      async () => {
        const startedAt = Date.now();
        console.log(`[cron:${job.name}] started`);

        try {
          await job.run();
          console.log(
            `[cron:${job.name}] completed in ${Date.now() - startedAt}ms`
          );
        } catch (err) {
          console.error(`[cron:${job.name}] failed:`, err);
        }
      },
      {
        timezone: env.CRON_TIMEZONE,
        scheduled: true,
      }
    );

    scheduledTasks.set(job.name, task);
    console.log(
      `[cron:${job.name}] scheduled (${job.schedule}, ${env.CRON_TIMEZONE})`
    );
  }
};

export const stopCronJobs = () => {
  for (const [name, task] of scheduledTasks) {
    task.stop();
    console.log(`[cron:${name}] stopped`);
  }

  scheduledTasks.clear();
};
