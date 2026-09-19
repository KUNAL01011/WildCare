// ✅ Correct with proxy
import type { CookieOptions } from "express";
import { env } from "./env.js";

const isProd = env.NODE_ENV === "production";

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax", // proxy makes all requests same-origin, lax works everywhere
  path: "/",
  maxAge: 10 * 1000,
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/api/auth/refresh",
  maxAge: 15 * 24 * 60 * 60 * 1000,
};

export const sessionCookieOptions: CookieOptions = {
  httpOnly: false,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 15 * 24 * 60 * 60 * 1000,
};
