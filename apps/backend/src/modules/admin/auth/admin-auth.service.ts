import { prisma } from "@/infrastructure/database/prisma";
import { signAccessToken } from "@/core/security/jwt";
import argon2 from "argon2";
import { AppError } from "@/core/errors/app-error";

const orm = (prisma as any).orm.public;

export async function adminLogin(email: string, password: string) {
  const admin = await orm.AdminUser
    .where({ email })
    .first();

  if (!admin || admin.status !== "ACTIVE") {
    throw new AppError("AUTH_REQUIRED", "Invalid credentials", 401);
  }

  const valid = await argon2.verify(admin.passwordHash, password);
  if (!valid) {
    throw new AppError("AUTH_REQUIRED", "Invalid credentials", 401);
  }

  const accessToken = await signAccessToken(admin.id, "admin");

  return {
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    accessToken,
  };
}
