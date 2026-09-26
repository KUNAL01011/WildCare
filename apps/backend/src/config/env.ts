import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),
  CORSORIGINS: z.string().default("http://localhost:5173"),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().default(""),
  REDIS_URL: z.string().min(1),

  ACCESS_SECRET: z.string().min(32),
  REFRESH_SECRET: z.string().min(32),
  OTP_VERIFY_SECRET: z.string().min(32),

  // ── Google Auth ────────────────────────────────────────────────────────
  GOOGLE_CLIENT_ID: z.string().min(1),

  // ── Cloudinary ──────────────────────────────────────────────────────────
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // ── Gemini AI (leave empty to use mock analysis) ────────────────────────
  GEMINI_API_KEY: z.string().optional(),

  // ── Email ──────────────────────────────────────────────────────────────
  EMAIL_FROM: z.string().default("WildCare <noreply@wildcare.app>"),

  RESEND_API_KEY: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.string().optional(),

  EMAIL_RATE_LIMIT: z.coerce.number().int().positive().default(100),

  EMAIL_RATE_LIMIT_DURATION: z.coerce.number().int().positive().default(60_000),

  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
});

export const env = envSchema.parse(process.env);
