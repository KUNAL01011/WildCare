import { UnrecoverableError, type Job } from "bullmq";

import { emailProvider } from "@/infrastructure/email/email.service";
import { EmailError } from "@/infrastructure/email/email.errors";
import type { SendEmailJobData } from "@/jobs/queues/email.queue";

export async function processEmail(job: Job<SendEmailJobData>): Promise<void> {
  const { to, subject, html } = job.data;

  try {
    await emailProvider.send({
      to,
      subject,
      html,
    });
  } catch (error) {
    if (error instanceof EmailError && !error.retryable) {
      throw new UnrecoverableError(error.message);
    }

    throw error;
  }
}
