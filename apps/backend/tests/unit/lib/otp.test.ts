import { describe, it, expect } from "vitest";
import { generateOtp } from "../../../src/lib/otp.js";

describe("generateOtp", () => {
  it("returns a 6-character string", () => {
    const otp = generateOtp();
    expect(otp).toHaveLength(6);
  });

  it("is numeric only", () => {
    for (let i = 0; i < 100; i++) {
      expect(generateOtp()).toMatch(/^\d{6}$/);
    }
  });

  it("pads with leading zeros", () => {
    // Can't force a specific value, but we can assert length is always 6
    for (let i = 0; i < 200; i++) {
      expect(generateOtp().length).toBe(6);
    }
  });

  it("produces different values across calls", () => {
    const otps = new Set(Array.from({ length: 50 }, () => generateOtp()));
    // With 1M possible values, 50 calls should not all collide
    expect(otps.size).toBeGreaterThan(1);
  });
});