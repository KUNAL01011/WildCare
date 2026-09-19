import crypto from "node:crypto";

export function generateOtp(): string {
  // Max safe value for unbiased modulo 1,000,000
  const MAX = 0x100000000 - (0x100000000 % 1_000_000);

  let value: number;
  do {
    value = crypto.randomBytes(4).readUInt32BE(0);
  } while (value >= MAX);

  return String(value % 1_000_000).padStart(6, "0");
}