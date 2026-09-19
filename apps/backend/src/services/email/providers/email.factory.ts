import { env } from "../../../config/env.js";
import type { IEmailProvider } from "./email-provider.interface.js";
// import { ResendProvider } from "./resend.provider.js";
import { ConsoleProvider } from "./console.provider.js";
import { NodemailerProvider } from "./nodemailer.provider.js"; // ← swap here
export function createEmailProvider(): IEmailProvider {
  if (env.NODE_ENV === "test") {
    return new ConsoleProvider();
  }

  if (env.NODE_ENV === "development" && !env.RESEND_API_KEY) {
    return new ConsoleProvider();
  }

  return new NodemailerProvider();
}
