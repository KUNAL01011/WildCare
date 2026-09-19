import { Resend } from "resend";
import { env } from "../../../config/env.js";
import type { IEmailProvider, SendEmailOptions } from "./email-provider.interface.js";
import { logger } from "../../../lib/logger.js";

export class ResendProvider implements IEmailProvider {
  private readonly client: Resend;
  private readonly from: string;

  constructor() {
    this.client = new Resend(env.RESEND_API_KEY);
    this.from = env.EMAIL_FROM;
  }

  async send(options: SendEmailOptions): Promise<void> {
    const { error } = await this.client.emails.send({
      from: this.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      logger.error({ provider: "resend", error }, "Resend delivery failed");
      throw new Error(`Resend error: ${error.message}`);
    }
  }
}