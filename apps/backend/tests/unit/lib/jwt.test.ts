import { describe, it, expect } from "vitest";
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signEmailVerificationToken,
  verifyEmailVerificationToken,
} from "../../../src/lib/jwt.js";

const FAKE_USER_ID = "550e8400-e29b-41d4-a716-446655440000";
const FAKE_FAMILY_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("Access Token", () => {
  it("signs and verifies successfully", async () => {
    const token = await signAccessToken(FAKE_USER_ID);
    const payload = await verifyAccessToken(token);

    expect(payload.userId).toBe(FAKE_USER_ID);
    expect(payload.type).toBe("access");
  });

  it("throws on tampered token", async () => {
    const token = await signAccessToken(FAKE_USER_ID);
    const tampered = token.slice(0, -5) + "XXXXX";

    await expect(verifyAccessToken(tampered)).rejects.toThrow();
  });

  it("throws when verifying with wrong type (refresh token)", async () => {
    const { token } = await signRefreshToken(FAKE_USER_ID, FAKE_FAMILY_ID);
    await expect(verifyAccessToken(token)).rejects.toThrow();
  });
});

describe("Refresh Token", () => {
  it("signs and verifies successfully", async () => {
    const { token, hash } = await signRefreshToken(
      FAKE_USER_ID,
      FAKE_FAMILY_ID
    );
    const payload = await verifyRefreshToken(token);

    expect(payload.userId).toBe(FAKE_USER_ID);
    expect(payload.familyId).toBe(FAKE_FAMILY_ID);
    expect(payload.type).toBe("refresh");
    expect(hash).toMatch(/^[a-f0-9]{64}$/); // sha256 hex
  });

  it("produces a SHA-256 hash for the token", async () => {
    const { hash } = await signRefreshToken(FAKE_USER_ID, FAKE_FAMILY_ID);

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash.length).toBe(64);
  });

  it("throws on invalid token", async () => {
    await expect(verifyRefreshToken("not.a.valid.jwt")).rejects.toThrow();
  });
});

describe("Email Verification Token", () => {
  it("signs and verifies successfully", async () => {
    const token = await signEmailVerificationToken(FAKE_USER_ID);
    const payload = await verifyEmailVerificationToken(token);

    expect(payload.userId).toBe(FAKE_USER_ID);
    expect(payload.type).toBe("email_verification");
  });

  it("throws when using access token as verification token", async () => {
    const accessToken = await signAccessToken(FAKE_USER_ID);
    await expect(verifyEmailVerificationToken(accessToken)).rejects.toThrow();
  });
});
