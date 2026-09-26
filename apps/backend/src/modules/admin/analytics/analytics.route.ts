import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { asyncHandler } from "@/core/middleware/async-handler.middleware";
import * as analyticsService from "./analytics.service";

const reportFilterSchema = z.object({
  state: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

const router = Router();

router.get(
  "/reports",
  asyncHandler(async (req: Request, res: Response) => {
    const params = reportFilterSchema.parse(req.query);
    const result = await analyticsService.getReportAnalytics(params);
    res.json({ success: true, data: result });
  })
);

router.get(
  "/bodies",
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await analyticsService.getBodyAnalytics();
    res.json({ success: true, data: result });
  })
);

router.get(
  "/feedback",
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await analyticsService.getFeedbackAnalytics();
    res.json({ success: true, data: result });
  })
);

router.get(
  "/response-time",
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await analyticsService.getResponseTimeAnalytics();
    res.json({ success: true, data: result });
  })
);

export default router;
