import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../../../src/lib/password.js";

describe("hashPassword", () => {
  it("produces a bcrypt hash", async () => {
    const hash = await hashPassword("MyPassword123!");
    expect(hash).toMatch(/^\$argon2id\$/);
  });

  it("produces different hashes for same input (salt)", async () => {
    const hash1 = await hashPassword("SamePassword");
    const hash2 = await hashPassword("SamePassword");
    expect(hash1).not.toBe(hash2);
  });
});

describe("comparePassword", () => {
  it("returns true for correct password", async () => {
    const password = "CorrectHorseBattery";
    const hash = await hashPassword(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it("returns false for wrong password", async () => {
    const hash = await hashPassword("CorrectPassword");
    expect(await verifyPassword("WrongPassword", hash)).toBe(false);
  });

  it("returns false for empty string", async () => {
    const hash = await hashPassword("SomePassword");
    expect(await verifyPassword("", hash)).toBe(false);
  });

  it("handles OTP verification (6-digit string)", async () => {
    const otp = "482910";
    const hash = await hashPassword(otp);
    expect(await verifyPassword(otp, hash)).toBe(true);
    expect(await verifyPassword("000000", hash)).toBe(false);
  });
});
