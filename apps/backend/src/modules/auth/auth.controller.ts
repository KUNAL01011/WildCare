import type { Request, Response } from "express";
import {
  getMe,
  login,
  logout,
  refresh,
  register,
  resendOtp,
  verifyEmail,
} from "./auth.service.js";
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
} from "./auth.validation.js";
import { asyncHandler } from "@/core/middleware/async-handler.middleware.js";
import { AppError } from "@/core/errors/app-error.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  sessionCookieOptions,
} from "@/config/cookies.js";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = registerSchema.parse(req.body);
    const result = await register(input);

    res.status(201).json({ success: true, data: result });
  }
);

export const verifyEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id; // set by verifyEmailTokenMiddleware
    const input = verifyEmailSchema.parse(req.body);
    const result = await verifyEmail(userId, input);

    res.status(200).json({ success: true, data: result });
  }
);

export const resendOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id; // set by verifyEmailTokenMiddleware
    const result = await resendOtp(userId);

    res.status(200).json({ success: true, data: result });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = loginSchema.parse(req.body);
    const { accessToken, refreshToken, user } = await login(input);

    res
      .cookie("accessToken", accessToken, accessTokenCookieOptions)
      .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
      .cookie("session", "1", sessionCookieOptions)
      .status(200)
      .json({ success: true, data: { user } });
  }
);

export const refreshController = asyncHandler(
  async (req: Request, res: Response) => {
    const rawRefreshToken = req.cookies?.refreshToken as string | undefined;

    if (!rawRefreshToken) {
      throw new AppError(
        "MISSING_REFRESH_TOKEN",
        "Refresh token is required",
        401
      );
    }

    const { accessToken, refreshToken } = await refresh(rawRefreshToken);

    res
      .cookie("accessToken", accessToken, accessTokenCookieOptions)
      .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
      .status(200)
      .json({ success: true, data: { message: "Token refreshed" } });
  }
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const rawRefreshToken = req.cookies?.refreshToken as string | undefined;

    if (rawRefreshToken) {
      await logout(rawRefreshToken);
    }

    res
      .clearCookie("accessToken", { path: "/" })
      .clearCookie("refreshToken", { path: "/api/auth/refresh" })
      .clearCookie("session", { path: "/" })
      .status(200)
      .json({ success: true, data: { message: "Logged out successfully" } });
  }
);

export const getMeController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id; // set by authenticateMiddleware
    const result = await getMe(userId);

    res.status(200).json({ success: true, data: result });
  }
);
