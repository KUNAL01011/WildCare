import nodemailer, { type Transporter } from "nodemailer";

import { env } from "@/config/env";
import type {
  EmailProvider,
  SendEmailOptions,
} from "./email-provider.interface";
import { EmailError } from "../email.errors";

export class NodemailerProvider implements EmailProvider {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE === 465,

      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },

      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });

    this.from = env.EMAIL_FROM;
  }

  async send({ to, subject, html }: SendEmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });
    } catch (error) {
      throw new EmailError(`Failed to send email to ${to}`, true);
    }
  }
}
