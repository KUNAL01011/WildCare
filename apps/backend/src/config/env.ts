import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),

  ACCESS_SECRET: z.string().min(32),
  REFRESH_SECRET: z.string().min(32),
  OTP_VERIFY_SECRET: z.string().min(32),

  // ── Email ──────────────────────────────────────────────────────────────
  EMAIL_FROM: z.string().default("TransitOps <noreply@transitops.dev>"),

  // Resend (used when NODE_ENV=production or explicitly set in dev)
  RESEND_API_KEY: z.string().optional(),

  // SMTP / Nodemailer — optional, only needed if using NodemailerProvider
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().min(1),
});

export const env = envSchema.parse(process.env);