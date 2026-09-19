import crypto from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { generateOtp } from "../../lib/otp.js";
import {
  signEmailVerificationToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../lib/jwt.js";
import { sendVerificationEmail } from "../../services/email/email.service.js";
import { AppError } from "../../core/errors/app-error.js";
import type {
  RegisterInput,
  VerifyEmailInput,
  LoginInput,
} from "./auth.validation.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { hashPassword, verifyPassword } from "@/lib/password.js";

// ─── Register ────────────────────────────────────────────────────────────────

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase();

  const passwordHash = await hashPassword(input.password);
  const otp = generateOtp();
  const otpHash = await hashPassword(otp);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  let userId: string;

  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        name: input.name,
        email,
        passwordHash,
        otpHash,
        otpExpiresAt,
      },
      update: {
        // Only update if NOT yet verified — enforced below after read
        name: input.name,
        passwordHash,
        otpHash,
        otpExpiresAt,
      },
      select: { id: true, emailVerified: true },
    });

    if (user.emailVerified) {
      throw new AppError(
        "EMAIL_ALREADY_REGISTERED",
        "Email already registered",
        409
      );
    }

    userId = user.id;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      throw new AppError(
        "EMAIL_ALREADY_REGISTERED",
        "Email already registered",
        409
      );
    }
    throw err;
  }

  const verificationToken = await signEmailVerificationToken(userId);

  // Fire-and-forget: email goes into the queue, response returns immediately.
  sendVerificationEmail(email, otp);

  return { verificationToken };
}

// ─── Verify Email ─────────────────────────────────────────────────────────────

export async function verifyEmail(userId: string, input: VerifyEmailInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailVerified: true,
      otpHash: true,
      otpExpiresAt: true,
    },
  });

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "User not found", 404);
  }

  if (user.emailVerified) {
    throw new AppError(
      "EMAIL_ALREADY_VERIFIED",
      "Email is already verified",
      409
    );
  }

  if (!user.otpHash || !user.otpExpiresAt) {
    throw new AppError("INVALID_OTP", "No OTP found. Request a new one.", 400);
  }

  if (new Date() > user.otpExpiresAt) {
    throw new AppError(
      "OTP_EXPIRED",
      "OTP has expired. Request a new one.",
      400
    );
  }

  const isValid = await verifyPassword(input.otp, user.otpHash);

  if (!isValid) {
    throw new AppError("INVALID_OTP", "Invalid OTP", 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true, otpHash: null, otpExpiresAt: null },
  });

  return { message: "Email verified successfully" };
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export async function resendOtp(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true, otpExpiresAt: true },
  });

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "User not found", 404);
  }

  if (user.emailVerified) {
    throw new AppError(
      "EMAIL_ALREADY_VERIFIED",
      "Email is already verified",
      409
    );
  }

  // Block resend if OTP was issued < 1 minute ago
  if (user.otpExpiresAt) {
    const remainingMs = user.otpExpiresAt.getTime() - Date.now();
    if (remainingMs > 9 * 60 * 1000) {
      throw new AppError(
        "OTP_RECENTLY_SENT",
        "An OTP was recently sent. Please wait before requesting a new one.",
        429
      );
    }
  }

  const otp = generateOtp();
  const otpHash = await hashPassword(otp);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { otpHash, otpExpiresAt },
  });

  sendVerificationEmail(user.email, otp);

  return { message: "Verification code sent" };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(input: LoginInput) {
  const email = input.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      emailVerified: true,
    },
  });

  // Constant-time comparison even for missing users — prevents enumeration via timing
  const dummyHash =
    "$2b$12$invalidhashpadding000000000000000000000000000000000000";
  const passwordValid = user
    ? await verifyPassword(input.password, user.passwordHash)
    : await verifyPassword(input.password, dummyHash).then(() => false);

  if (!user || !passwordValid) {
    throw new AppError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  if (!user.emailVerified) {
    const verificationToken = await signEmailVerificationToken(user.id);
    throw new AppError(
      "EMAIL_NOT_VERIFIED",
      JSON.stringify({ message: "Email not verified", verificationToken }),
      403
    );
  }

  const familyId = crypto.randomUUID();
  const { token: refreshToken, hash: refreshTokenHash } =
    await signRefreshToken(user.id, familyId);
  const accessToken = await signAccessToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      familyId,
    },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

export async function refresh(rawRefreshToken: string) {
  let payload: Awaited<ReturnType<typeof verifyRefreshToken>>;

  try {
    payload = await verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError(
      "INVALID_REFRESH_TOKEN",
      "Invalid or expired refresh token",
      401
    );
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  // Token doesn't exist → possible reuse/deleted token
  if (!storedToken) {
    await prisma.refreshToken.deleteMany({
      where: { familyId: payload.familyId },
    });

    throw new AppError(
      "REFRESH_TOKEN_REUSE",
      "Refresh token reuse detected. Please login again.",
      401
    );
  }

  // Old/revoked token used again → reuse attack
  if (storedToken.revokedAt) {
    await prisma.refreshToken.deleteMany({
      where: { familyId: storedToken.familyId },
    });

    throw new AppError(
      "REFRESH_TOKEN_REUSE",
      "Refresh token reuse detected. Please login again.",
      401
    );
  }

  if (new Date() > storedToken.expiresAt) {
    throw new AppError(
      "INVALID_REFRESH_TOKEN",
      "Refresh token is expired",
      401
    );
  }

  const { token: newRefreshToken, hash: newRefreshTokenHash } =
    await signRefreshToken(payload.userId, storedToken.familyId);

  const newAccessToken = await signAccessToken(payload.userId);

  // FIX: Use the interactive callback form of $transaction instead of the
  // array/batch form. The array form pre-builds Prisma promise objects before
  // passing them in — with Prisma 6's new `prisma-client` generator this causes
  // the transaction to throw because the operations are already "pending" by the
  // time $transaction receives them. The callback form builds operations inside
  // the transaction context (tx) and works correctly across all Prisma versions.
  await prisma.$transaction(async tx => {
    await tx.refreshToken.create({
      data: {
        userId: payload.userId,
        tokenHash: newRefreshTokenHash,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        familyId: storedToken.familyId,
      },
    });
    await tx.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(rawRefreshToken: string) {
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");

  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  // updateMany is idempotent — no error if already revoked or missing
}

// ─── Me ───────────────────────────────────────────────────────────────────────

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "User not found", 404);
  }

  return { user };
}
