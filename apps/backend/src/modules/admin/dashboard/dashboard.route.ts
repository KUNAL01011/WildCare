import { Router, type Request, type Response } from "express";
import { asyncHandler } from "@/core/middleware/async-handler.middleware";
import * as dashboardService from "./dashboard.service";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const stats = await dashboardService.getDashboardStats();
    res.json({ success: true, data: stats });
  })
);

export default router;
