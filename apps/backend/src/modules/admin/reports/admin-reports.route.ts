import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { asyncHandler } from "@/core/middleware/async-handler.middleware";
import * as adminReportsService from "./admin-reports.service";

const listSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  animal: z.string().optional(),
  condition: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

const router = Router();

router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const params = listSchema.parse(req.query);
    const result = await adminReportsService.listReports(params);
    res.json({ success: true, data: result });
  })
);

router.get(
  "/:reportId",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await adminReportsService.getReportById(req.params.reportId);
    res.json({ success: true, data: result });
  })
);

router.delete(
  "/:reportId",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await adminReportsService.deleteReport(req.params.reportId);
    res.json({ success: true, data: result });
  })
);

export default router;
