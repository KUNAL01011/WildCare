import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { verifyAccessToken } from "../security/jwt";

function extractBearerToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return undefined;
}

export async function authenticateMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw new AppError("AUTH_REQUIRED", "Authentication required", 401);
    }

    const payload = await verifyAccessToken(token);

    if (payload.role !== "citizen") {
      throw new AppError("FORBIDDEN", "Access denied", 403);
    }

    req.user = { id: payload.userId, role: "citizen" };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError("AUTH_REQUIRED", "Invalid or expired access token", 401));
  }
}

export async function adminAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw new AppError("AUTH_REQUIRED", "Authentication required", 401);
    }

    const payload = await verifyAccessToken(token);

    if (payload.role !== "admin") {
      throw new AppError("FORBIDDEN", "Admin access required", 403);
    }

    req.user = { id: payload.userId, role: "admin" };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError("AUTH_REQUIRED", "Invalid or expired access token", 401));
  }
}
