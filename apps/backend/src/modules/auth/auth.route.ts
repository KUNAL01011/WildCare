import { Router, type Request, type Response } from "express";
import { asyncHandler } from "@/core/middleware/async-handler.middleware";
import { authenticateMiddleware } from "@/core/middleware/auth.middleware";
import { googleAuthSchema } from "./auth.schema";
import * as authService from "./auth.service";

const router = Router();

router.post(
  "/google",
  asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = googleAuthSchema.parse(req.body);
    const result = await authService.loginWithGoogle(idToken);
    res.json({ success: true, data: result });
  })
);

router.get(
  "/me",
  authenticateMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.id);
    res.json({ success: true, data: user });
  })
);

export default router;
