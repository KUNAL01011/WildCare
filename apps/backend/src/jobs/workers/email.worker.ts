import { Worker } from "bullmq";

import { env } from "@/config/env";
import { getQueueConnection } from "@/infrastructure/queue/connection";
import { logger } from "@/core/logger/logger";
import { EMAIL_QUEUE_NAME } from "@/jobs/queues/email.queue";
import { processEmail } from "@/jobs/processors/email.processor";

let emailWorker: Worker | null = null;

export function startEmailWorker(): void {
  if (emailWorker) {
    return;
  }

  emailWorker = new Worker(
    EMAIL_QUEUE_NAME,
    async job => {
      await processEmail(job);
    },
    {
      connection: getQueueConnection(),

      concurrency: 5,

      limiter: {
        max: env.EMAIL_RATE_LIMIT,
        duration: env.EMAIL_RATE_LIMIT_DURATION,
      },
    }
  );

  emailWorker.on("completed", job => {
    logger.info(
      {
        jobId: job.id,
        to: job.data.to,
      },
      "Email job completed"
    );
  });

  emailWorker.on("failed", (job, error) => {
    logger.error(
      {
        jobId: job?.id,
        to: job?.data.to,
        error: error.message,
      },
      "Email job failed"
    );
  });

  emailWorker.on("error", error => {
    logger.error(
      {
        error: error.message,
      },
      "Email worker error"
    );
  });

  logger.info("Email worker started");
}

export async function stopEmailWorker(): Promise<void> {
  if (!emailWorker) {
    return;
  }

  await emailWorker.close();
  emailWorker = null;

  logger.info("Email worker stopped");
}
