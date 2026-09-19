import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import request, { type Response } from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";

// ── Mock email so no real sends happen ─────────────────────────────────────
vi.mock("../../src/lib/resend.js", () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ id: "mock-email-id" }),
    },
  },
}));

// ── Capture OTPs without touching email ────────────────────────────────────
let capturedOtp = "";
vi.mock("../../src/lib/otp.js", () => ({
  generateOtp: vi.fn(() => {
    capturedOtp = "123456";
    return capturedOtp;
  }),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

/** Safely extract set-cookie as string[] regardless of how supertest returns it */
function getCookies(res: Response): string[] {
  const raw = res.headers["set-cookie"] as string | string[] | undefined;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

const TEST_USER = {
  name: "Test User",
  email: `test+${Date.now()}@example.com`,
  password: "ValidPass123!",
};

async function cleanupUser(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
}

// ── Test suite ─────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  beforeEach(async () => {
    await cleanupUser(TEST_USER.email);
  });

  afterAll(async () => {
    await cleanupUser(TEST_USER.email);
    await prisma.$disconnect();
  });

  it("201 — creates user and returns verificationToken", async () => {
    const res = await request(app).post("/api/auth/register").send(TEST_USER);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.verificationToken).toBeTypeOf("string");
  });

  it("409 — rejects already-verified email", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(TEST_USER);
    const { verificationToken } = registerRes.body.data;

    await request(app)
      .post("/api/auth/verify-email")
      .set("Authorization", `Bearer ${verificationToken}`)
      .send({ otp: capturedOtp });

    const res = await request(app).post("/api/auth/register").send(TEST_USER);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_ALREADY_REGISTERED");
  });

  it("400 — rejects missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "bad" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("400 — rejects weak password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...TEST_USER, password: "short" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/verify-email", () => {
  let verificationToken: string;

  beforeEach(async () => {
    await cleanupUser(TEST_USER.email);
    const res = await request(app).post("/api/auth/register").send(TEST_USER);
    verificationToken = res.body.data.verificationToken;
  });

  afterAll(async () => {
    await cleanupUser(TEST_USER.email);
  });

  it("200 — verifies email with correct OTP", async () => {
    const res = await request(app)
      .post("/api/auth/verify-email")
      .set("Authorization", `Bearer ${verificationToken}`)
      .send({ otp: capturedOtp });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain("verified");
  });

  it("400 — rejects wrong OTP", async () => {
    const res = await request(app)
      .post("/api/auth/verify-email")
      .set("Authorization", `Bearer ${verificationToken}`)
      .send({ otp: "000000" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_OTP");
  });

  it("400 — rejects non-numeric OTP", async () => {
    const res = await request(app)
      .post("/api/auth/verify-email")
      .set("Authorization", `Bearer ${verificationToken}`)
      .send({ otp: "abcdef" });

    expect(res.status).toBe(400);
  });

  it("401 — rejects missing Authorization header", async () => {
    const res = await request(app)
      .post("/api/auth/verify-email")
      .send({ otp: capturedOtp });

    expect(res.status).toBe(401);
  });

  it("409 — rejects already-verified email", async () => {
    await request(app)
      .post("/api/auth/verify-email")
      .set("Authorization", `Bearer ${verificationToken}`)
      .send({ otp: capturedOtp });

    const res2 = await request(app)
      .post("/api/auth/verify-email")
      .set("Authorization", `Bearer ${verificationToken}`)
      .send({ otp: capturedOtp });

    expect(res2.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  let verificationToken: string;

  beforeEach(async () => {
    await cleanupUser(TEST_USER.email);
    const reg = await request(app).post("/api/auth/register").send(TEST_USER);
    verificationToken = reg.body.data.verificationToken;
    await request(app)
      .post("/api/auth/verify-email")
      .set("Authorization", `Bearer ${verificationToken}`)
      .send({ otp: capturedOtp });
  });

  afterAll(async () => {
    await cleanupUser(TEST_USER.email);
  });

  it("200 — sets httpOnly cookies on successful login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(TEST_USER.email);

    const cookies = getCookies(res);

    // FIX: Only assert HttpOnly on the actual auth token cookies.
    // The `session` cookie is intentionally a JS-readable client-side flag
    // (no httpOnly) so the frontend can detect login state without a round-trip.
    // Using cookies.every() would fail because of that cookie — filter first.
    const authCookies = cookies.filter(
      c => c.startsWith("accessToken=") || c.startsWith("refreshToken=")
    );
    expect(authCookies.length).toBe(2);
    expect(authCookies.every(c => c.toLowerCase().includes("httponly"))).toBe(
      true
    );
  });

  it("401 — rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_USER.email, password: "WrongPass999!" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("401 — rejects non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost@example.com", password: "SomePass123!" });

    expect(res.status).toBe(401);
  });

  it("403 — rejects unverified user", async () => {
    const unverifiedEmail = `unverified+${Date.now()}@example.com`;
    await request(app)
      .post("/api/auth/register")
      .send({
        ...TEST_USER,
        email: unverifiedEmail,
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: unverifiedEmail, password: TEST_USER.password });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("EMAIL_NOT_VERIFIED");

    await cleanupUser(unverifiedEmail);
  });
});

describe("POST /api/auth/refresh", () => {
  let refreshTokenCookie: string;

  beforeEach(async () => {
    await cleanupUser(TEST_USER.email);
    const reg = await request(app).post("/api/auth/register").send(TEST_USER);
    const vt = reg.body.data.verificationToken;
    await request(app)
      .post("/api/auth/verify-email")
      .set("Authorization", `Bearer ${vt}`)
      .send({ otp: capturedOtp });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    refreshTokenCookie = getCookies(loginRes).find(c =>
      c.startsWith("refreshToken=")
    )!;
  });

  afterAll(async () => {
    await cleanupUser(TEST_USER.email);
  });

  it("200 — rotates tokens and issues new cookies", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", refreshTokenCookie);

    expect(res.status).toBe(200);

    const newCookies = getCookies(res);
    expect(newCookies.some(c => c.startsWith("accessToken="))).toBe(true);
    expect(newCookies.some(c => c.startsWith("refreshToken="))).toBe(true);
  });

  it("401 — rejects missing cookie", async () => {
    const res = await request(app).post("/api/auth/refresh");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("MISSING_REFRESH_TOKEN");
  });

  it("401 — detects token reuse and revokes family", async () => {
    const firstRefresh = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", refreshTokenCookie);

    console.log("REFRESH RESPONSE:", firstRefresh.status, firstRefresh.body);
    expect(firstRefresh.status).toBe(200);

    const reuseRes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", refreshTokenCookie);

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.error.code).toBe("REFRESH_TOKEN_REUSE");
  });
});

describe("POST /api/auth/logout", () => {
  let refreshTokenCookie: string;

  beforeEach(async () => {
    await cleanupUser(TEST_USER.email);
    const reg = await request(app).post("/api/auth/register").send(TEST_USER);
    const vt = reg.body.data.verificationToken;
    await request(app)
      .post("/api/auth/verify-email")
      .set("Authorization", `Bearer ${vt}`)
      .send({ otp: capturedOtp });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    refreshTokenCookie = getCookies(loginRes).find(c =>
      c.startsWith("refreshToken=")
    )!;
  });

  afterAll(async () => {
    await cleanupUser(TEST_USER.email);
  });

  it("200 — logs out and clears cookies", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", refreshTokenCookie);

    expect(res.status).toBe(200);

    const clearedCookies = getCookies(res);
    expect(
      clearedCookies.some(
        c => c.startsWith("accessToken=;") || c.startsWith("accessToken=;")
      )
    ).toBe(true);
  });

  it("200 — idempotent: logout without cookie still succeeds", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
  });

  it("401 — refresh is blocked after logout", async () => {
    await request(app)
      .post("/api/auth/logout")
      .set("Cookie", refreshTokenCookie);

    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", refreshTokenCookie);

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  let accessTokenCookie: string;

  beforeEach(async () => {
    await cleanupUser(TEST_USER.email);
    const reg = await request(app).post("/api/auth/register").send(TEST_USER);
    const vt = reg.body.data.verificationToken;
    await request(app)
      .post("/api/auth/verify-email")
      .set("Authorization", `Bearer ${vt}`)
      .send({ otp: capturedOtp });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    accessTokenCookie = getCookies(loginRes).find(c =>
      c.startsWith("accessToken=")
    )!;
  });

  afterAll(async () => {
    await cleanupUser(TEST_USER.email);
  });

  it("200 — returns user profile", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", accessTokenCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    expect(res.body.data.user).not.toHaveProperty("passwordHash");
    expect(res.body.data.user).not.toHaveProperty("otpHash");
  });

  it("401 — rejects missing cookie", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
