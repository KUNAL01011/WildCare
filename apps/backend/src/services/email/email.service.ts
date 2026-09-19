import { createEmailProvider } from "./providers/email.factory.js";
import { EmailQueue } from "./queue/email.queue.js";
import { verificationEmailTemplate } from "./templates/verification.template.js";

// ── Singleton ──────────────────────────────────────────────────────────────
// One queue per process. All callers share the same concurrency pool.

const provider = createEmailProvider();
const queue = new EmailQueue(provider);

// ── Public API ─────────────────────────────────────────────────────────────
// Add one function per email type. auth.service only imports from here —
// it never knows about providers, queues, or templates.

/**
 * Enqueues a verification OTP email.
 * Returns immediately — delivery is async and does not block registration.
 */
export function sendVerificationEmail(to: string, otp: string): void {
  const { subject, html } = verificationEmailTemplate(otp);
  queue.enqueue({ to, subject, html });
}

/** Expose queue size for health/metrics endpoints if needed. */
export function getEmailQueueSize(): number {
  return queue.size;
}