import { logger } from "../../../lib/logger.js";
import type { IEmailProvider, SendEmailOptions } from "../providers/email-provider.interface.js";

interface QueueJob {
  id: string;
  options: SendEmailOptions;
  attempts: number;
  addedAt: number;
}

interface EmailQueueConfig {
  /** Max parallel sends at any moment. Resend free tier = 2 req/s. */
  concurrency: number;
  /** Max times to retry a failed send before dropping the job. */
  maxAttempts: number;
  /** Base delay in ms for exponential backoff. Doubles each retry. */
  baseRetryDelayMs: number;
}

const DEFAULT_CONFIG: EmailQueueConfig = {
  concurrency: 2,   // safe for Resend free tier; raise for paid
  maxAttempts: 3,
  baseRetryDelayMs: 1000,
};

/**
 * In-process email queue.
 *
 * WHY: Without this, 50 simultaneous registrations fire 50 concurrent
 * Resend API calls. Free tier is 2 req/s — you get 429s, users never
 * receive their OTP, and auth.service gets an unhandled rejection.
 *
 * HOW: Jobs enter a FIFO queue. A fixed-size worker pool (concurrency)
 * drains it. Failed jobs retry with exponential backoff up to maxAttempts.
 *
 * PRODUCTION NOTE: For true durability (survives process restarts),
 * replace this with BullMQ + Redis. The IEmailProvider interface stays
 * identical — only this file changes.
 */
export class EmailQueue {
  private readonly queue: QueueJob[] = [];
  private activeWorkers = 0;
  private readonly config: EmailQueueConfig;
  private readonly provider: IEmailProvider;

  constructor(provider: IEmailProvider, config: Partial<EmailQueueConfig> = {}) {
    this.provider = provider;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Enqueue an email. Returns immediately — does not wait for delivery. */
  enqueue(options: SendEmailOptions): void {
    const job: QueueJob = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      options,
      attempts: 0,
      addedAt: Date.now(),
    };

    this.queue.push(job);
    logger.debug({ jobId: job.id, to: options.to }, "Email job enqueued");

    this.drain();
  }

  /** How many jobs are waiting. Useful for health checks. */
  get size(): number {
    return this.queue.length;
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private drain(): void {
    while (
      this.activeWorkers < this.config.concurrency &&
      this.queue.length > 0
    ) {
      const job = this.queue.shift()!;
      this.process(job);
    }
  }

  private async process(job: QueueJob): Promise<void> {
    this.activeWorkers++;

    try {
      job.attempts++;
      await this.provider.send(job.options);

      logger.info(
        { jobId: job.id, to: job.options.to, attempts: job.attempts },
        "Email delivered"
      );
    } catch (err) {
      if (job.attempts < this.config.maxAttempts) {
        const delayMs = this.config.baseRetryDelayMs * 2 ** (job.attempts - 1);

        logger.warn(
          { jobId: job.id, to: job.options.to, attempt: job.attempts, retryInMs: delayMs },
          "Email delivery failed — scheduling retry"
        );

        setTimeout(() => {
          this.queue.unshift(job); // front of queue — retry before new jobs
          this.drain();
        }, delayMs);
      } else {
        logger.error(
          { jobId: job.id, to: job.options.to, attempts: job.attempts, err },
          "Email permanently failed after max attempts"
        );
        // In production: push to a dead-letter store / alert
      }
    } finally {
      this.activeWorkers--;
      this.drain(); // pick up next job immediately
    }
  }
}