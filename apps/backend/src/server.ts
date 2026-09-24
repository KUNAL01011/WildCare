import http from "node:http";
import app from "./app";
import { env } from "@/config/env";
import {
  connectRedis,
  disconnectRedis,
} from "@/infrastructure/redis/redis.client";
import { startJobs, stopJobs } from "@/jobs";
import { logger } from "@/core/logger/logger";

const server = http.createServer(app);
let shuttingDown = false;

async function start(): Promise<void> {
  try {
    // 1. Infrastructure (Prisma 8 connects automatically, so we just connect Redis)
    await connectRedis();

    // 2. Background jobs
    await startJobs();

    // 3. HTTP server
    server.listen(env.PORT, () => {
      logger.info(
        { port: env.PORT, environment: env.NODE_ENV, pid: process.pid },
        "API server started"
      );
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
}

void start();

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Shutdown signal received");

  try {
    // 1. Stop accepting HTTP requests
    await new Promise<void>((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    });

    // 2. Stop workers
    await stopJobs();

    // 3. Disconnect Redis (Prisma handles its own DB cleanup)
    await disconnectRedis();

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "Error during graceful shutdown");
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
