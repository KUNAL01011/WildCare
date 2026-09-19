import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { verifyAccessToken, verifyEmailVerificationToken } from "@/lib/jwt.js";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export async function authenticateMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.accessToken as string | undefined;

    if (!token) {
      throw new AppError(
        "MISSING_ACCESS_TOKEN",
        "Authentication required",
        401
      );
    }

    const payload = await verifyAccessToken(token);
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(
      new AppError(
        "INVALID_ACCESS_TOKEN",
        "Invalid or expired access token",
        401
      )
    );
  }
}

export async function verifyEmailTokenMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(
        "MISSING_VERIFICATION_TOKEN",
        "Verification token is required",
        401
      );
    }

    const token = authHeader.slice(7);
    const payload = await verifyEmailVerificationToken(token);
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(
      new AppError(
        "INVALID_VERIFICATION_TOKEN",
        "Invalid or expired verification token",
        401
      )
    );
  }
}
