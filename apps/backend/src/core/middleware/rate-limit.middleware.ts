import { env } from "@/config/env.js";
import rateLimit from "express-rate-limit";

const isTest = env.NODE_ENV === "test";

const skipRateLimitInTests = () => isTest;

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipRateLimitInTests,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later.",
    },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipRateLimitInTests,
  message: {
    success: false,
    error: {
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      message: "Too many authentication requests. Please try again later.",
    },
  },
});

export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipRateLimitInTests,
  message: {
    success: false,
    error: {
      code: "OTP_RATE_LIMIT_EXCEEDED",
      message: "Too many OTP attempts. Please try again later.",
    },
  },
});
