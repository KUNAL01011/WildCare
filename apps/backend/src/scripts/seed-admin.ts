import "dotenv/config";
import argon2 from "argon2";
import { db } from "../prisma/db";

const orm = (db as any).orm.public;

async function main() {
  const email = "admin@wildcare.app";
  const password = "admin123";

  const existing = await orm.AdminUser
    .where({ email })
    .first();

  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const passwordHash = await argon2.hash(password);

  await orm.AdminUser.create({
    name: "Super Admin",
    email,
    passwordHash,
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  });

  console.log("Admin user created!");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
