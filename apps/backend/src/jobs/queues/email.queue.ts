import { Queue } from "bullmq";

import { getQueueConnection } from "@/infrastructure/queue/connection";

export const EMAIL_QUEUE_NAME = "email";

export interface SendEmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const emailQueue = new Queue<SendEmailJobData>(EMAIL_QUEUE_NAME, {
  connection: getQueueConnection(),

  defaultJobOptions: {
    attempts: 5,

    backoff: {
      type: "exponential",
      delay: 5_000,
    },
  },
});

export async function enqueueEmail(data: SendEmailJobData) {
  return emailQueue.add("send-email", data);
}
