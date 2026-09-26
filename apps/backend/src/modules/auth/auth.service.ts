import { prisma } from "@/infrastructure/database/prisma";
import { signAccessToken, verifyGoogleIdToken } from "@/core/security/jwt";
import { AppError } from "@/core/errors/app-error";

const orm = (prisma as any).orm.public;

export async function loginWithGoogle(idToken: string) {
  const googleUser = await verifyGoogleIdToken(idToken);

  let user = await orm.User.where({ googleId: googleUser.sub }).first();

  if (!user) {
    user = await orm.User.create({
      googleId: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      profileImage: googleUser.picture ?? null,
    });
  } else {
    user = await orm.User.where({ id: user.id }).update({
      name: googleUser.name,
      profileImage: googleUser.picture ?? null,
    });
  }

  const accessToken = await signAccessToken(user.id, "citizen");

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
    },
    accessToken,
  };
}

export async function getMe(userId: string) {
  const user = await orm.User.where({ id: userId }).first();

  if (!user) {
    throw new AppError("RESOURCE_NOT_FOUND", "User not found", 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
  };
}
