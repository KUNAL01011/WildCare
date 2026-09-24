import type { EmailProvider } from "../email/providers/email-provider.interface";
import { NodemailerProvider } from "./providers/nodemailer.provider";

export const emailProvider: EmailProvider = new NodemailerProvider();
