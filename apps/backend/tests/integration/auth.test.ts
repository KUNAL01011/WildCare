import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import request, { type Response } from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";

vi.mock("../../src/lib/resend.js", () => ({
  resend: {
    emails: { send: vi.fn().mockResolvedValue({ id: "mock-email-id" }) },
  },
}));

let capturedOtp = "";
vi.mock("../../src/lib/otp.js", () => ({
  generateOtp: vi.fn(() => {
    capturedOtp = "123456";
    return capturedOtp;
  }),
}));

const TEST_USER = {
  name: "Test Citizen",
  email: `test+${Date.now()}@example.com`,
  password: "ValidPass123!",
};

function getCookies(res: Response): string[] {
  const raw = res.headers["set-cookie"] as string | string[] | undefined;
  return raw ? (Array.isArray(raw) ? raw : [raw]) : [];
}

async function cleanupUser() {
  const user = await prisma.user.findUnique({
    where: { email: TEST_USER.email },
  });
  if (user) await prisma.user.delete({ where: { id: user.id } });
}

async function verifyCitizen() {
  const registration = await request(app)
    .post("/api/v1/auth/register")
    .send(TEST_USER);
  await request(app)
    .post("/api/v1/auth/verify-email")
    .set("Authorization", `Bearer ${registration.body.data.verificationToken}`)
    .send({ otp: capturedOtp });
}

describe("WildCare authentication", () => {
  beforeEach(cleanupUser);

  afterAll(async () => {
    await cleanupUser();
    await prisma.$disconnect();
  });

  it("registers a citizen and starts OTP verification", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(TEST_USER);
    expect(response.status).toBe(201);
    expect(response.body.data.verificationToken).toBeTypeOf("string");
  });

  it("verifies a citizen email with an OTP", async () => {
    const registration = await request(app)
      .post("/api/v1/auth/register")
      .send(TEST_USER);
    const response = await request(app)
      .post("/api/v1/auth/verify-email")
      .set(
        "Authorization",
        `Bearer ${registration.body.data.verificationToken}`
      )
      .send({ otp: capturedOtp });

    expect(response.status).toBe(200);
    expect(response.body.data.message).toContain("verified");
  });

  it("returns JWTs in the body for a mobile citizen login", async () => {
    await verifyCitizen();
    const response = await request(app).post("/api/v1/auth/login").send({
      email: TEST_USER.email,
      password: TEST_USER.password,
      client: "MOBILE",
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user.role).toBe("CITIZEN");
    expect(response.body.data.accessToken).toBeTypeOf("string");
    expect(response.body.data.refreshToken).toBeTypeOf("string");
    expect(getCookies(response)).toHaveLength(0);
  });

  it("authorizes a mobile citizen using a bearer access token", async () => {
    await verifyCitizen();
    const login = await request(app).post("/api/v1/auth/login").send({
      email: TEST_USER.email,
      password: TEST_USER.password,
      client: "MOBILE",
    });
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${login.body.data.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.role).toBe("CITIZEN");
  });

  it("rotates mobile refresh tokens passed in the request body", async () => {
    await verifyCitizen();
    const login = await request(app).post("/api/v1/auth/login").send({
      email: TEST_USER.email,
      password: TEST_USER.password,
      client: "MOBILE",
    });
    const response = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: login.body.data.refreshToken,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeTypeOf("string");
    expect(response.body.data.refreshToken).toBeTypeOf("string");
    expect(getCookies(response)).toHaveLength(0);
  });

  it("prevents citizens from using dashboard authentication", async () => {
    await verifyCitizen();
    const response = await request(app).post("/api/v1/auth/login").send({
      email: TEST_USER.email,
      password: TEST_USER.password,
      client: "DASHBOARD",
    });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("AUTH_CLIENT_NOT_ALLOWED");
  });

  it("sets HTTP-only cookies for provisioned responder dashboard login", async () => {
    await verifyCitizen();
    await prisma.user.update({
      where: { email: TEST_USER.email },
      data: { role: "RESPONDER" },
    });
    const response = await request(app).post("/api/v1/auth/login").send({
      email: TEST_USER.email,
      password: TEST_USER.password,
      client: "DASHBOARD",
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user.role).toBe("RESPONDER");
    expect(response.body.data).not.toHaveProperty("accessToken");
    expect(response.body.data).not.toHaveProperty("refreshToken");
    expect(
      getCookies(response).filter(cookie => cookie.includes("HttpOnly"))
    ).toHaveLength(2);
  });
});
