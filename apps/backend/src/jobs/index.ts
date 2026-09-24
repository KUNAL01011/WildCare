import { startEmailWorker, stopEmailWorker } from "./workers/email.worker";
import { disconnectRedis } from "@/infrastructure/redis/redis.client";
import { logger } from "@/core/logger/logger";

export async function startJobs(): Promise<void> {
  startEmailWorker();
}

export async function stopJobs(): Promise<void> {
  await stopEmailWorker();
}

// ------------------------------------------------------------------
// INDEPENDENT WORKER RUNNER & GRACEFUL SHUTDOWN
// ------------------------------------------------------------------
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Worker shutdown signal received");

    try {
      // 1. Stop processing new jobs
      await stopJobs();

      // 2. Disconnect Redis (Prisma handles its own cleanup)
      await disconnectRedis();

      logger.info("Worker graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      logger.error({ error }, "Error during worker graceful shutdown");
      process.exit(1);
    }
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  // Start the worker instance
  startJobs()
    .then(() => {
      logger.info("Independent background worker process started");
    })
    .catch(err => {
      logger.error({ err }, "Failed to start independent worker");
      process.exit(1);
    });
}
