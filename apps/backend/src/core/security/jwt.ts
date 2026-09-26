import { env } from "@/config/env";
import * as jose from "jose";
import crypto from "node:crypto";

const encode = (secret: string) => new TextEncoder().encode(secret);

const accessSecret = encode(env.ACCESS_SECRET);
const refreshSecret = encode(env.REFRESH_SECRET);

export interface AccessTokenPayload {
  userId: string;
  role: "citizen" | "admin";
  type: "access";
}

export interface RefreshTokenPayload {
  userId: string;
  familyId: string;
  type: "refresh";
}

// ─── Access Token ─────────────────────────────────────────────────────────────

export async function signAccessToken(
  userId: string,
  role: "citizen" | "admin"
): Promise<string> {
  return new jose.SignJWT({
    userId,
    role,
    type: "access",
  } satisfies AccessTokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
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

// ─── Google ID Token Verification ─────────────────────────────────────────────

const GOOGLE_JWKS = jose.createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

export async function verifyGoogleIdToken(
  idToken: string
): Promise<GoogleTokenPayload> {
  const { payload } = await jose.jwtVerify(idToken, GOOGLE_JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: env.GOOGLE_CLIENT_ID,
  });

  return {
    sub: payload.sub!,
    email: payload["email"] as string,
    name: payload["name"] as string,
    picture: payload["picture"] as string | undefined,
    email_verified: payload["email_verified"] as boolean | undefined,
  };
}
