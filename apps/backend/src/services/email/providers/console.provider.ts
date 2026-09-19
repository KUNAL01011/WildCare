import type { IEmailProvider, SendEmailOptions } from "./email-provider.interface.js";
import { logger } from "../../../lib/logger.js";

export class ConsoleProvider implements IEmailProvider {
  async send(options: SendEmailOptions): Promise<void> {
    logger.info(
      {
        provider: "console",
        to: options.to,
        subject: options.subject,
      },
      `[EMAIL] ${options.subject} → ${options.to}\n${options.html}`
    );
  }
}