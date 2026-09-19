// import { SignJWT, jwtVerify } from "jose";
import * as jose from "jose";
import { env } from "../config/env.js";
import crypto from "node:crypto";

// ─── Key helpers ─────────────────────────────────────────────────────────────

const encode = (secret: string) => new TextEncoder().encode(secret);

const accessSecret = encode(env.ACCESS_SECRET);
const refreshSecret = encode(env.REFRESH_SECRET);
const otpVerifySecret = encode(env.OTP_VERIFY_SECRET);

// ─── Payload shapes ──────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  userId: string;
  type: "access";
}

export interface RefreshTokenPayload {
  userId: string;
  familyId: string;
  type: "refresh";
}

export interface EmailVerificationTokenPayload {
  userId: string;
  type: "email_verification";
}

// ─── Access Token ─────────────────────────────────────────────────────────────

export async function signAccessToken(userId: string): Promise<string> {
  return new jose.SignJWT({
    userId,
    type: "access",
  } satisfies AccessTokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(accessSecret);
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload> {
  const { payload } = await jose.jwtVerify(token, accessSecret);

  if (payload["type"] !== "access") {
    throw new Error("Invalid token type");
  }

  return payload as unknown as AccessTokenPayload;
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
// Raw token is stored in a cookie; we only persist a SHA-256 hash in the DB.

export async function signRefreshToken(
  userId: string,
  familyId: string
): Promise<{ token: string; hash: string }> {
  const token = await new jose.SignJWT({
    userId,
    familyId,
    type: "refresh",
  } satisfies RefreshTokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime("15d")
    .sign(refreshSecret);

  const hash = crypto.createHash("sha256").update(token).digest("hex");

  return { token, hash };
}

export async function verifyRefreshToken(
  token: string
): Promise<RefreshTokenPayload> {
  const { payload } = await jose.jwtVerify(token, refreshSecret);

  if (payload["type"] !== "refresh") {
    throw new Error("Invalid token type");
  }

  return payload as unknown as RefreshTokenPayload;
}

// ─── Email Verification Token ─────────────────────────────────────────────────

export async function signEmailVerificationToken(
  userId: string
): Promise<string> {
  return new jose.SignJWT({
    userId,
    type: "email_verification",
  } satisfies EmailVerificationTokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(otpVerifySecret);
}

export async function verifyEmailVerificationToken(
  token: string
): Promise<EmailVerificationTokenPayload> {
  const { payload } = await jose.jwtVerify(token, otpVerifySecret);

  if (payload["type"] !== "email_verification") {
    throw new Error("Invalid token type");
  }

  return payload as unknown as EmailVerificationTokenPayload;
}
