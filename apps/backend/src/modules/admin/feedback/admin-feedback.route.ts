import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { asyncHandler } from "@/core/middleware/async-handler.middleware";
import * as adminFeedbackService from "./admin-feedback.service";

const listSchema = z.object({
  bodyId: z.string().optional(),
  bodyType: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
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
    const result = await adminFeedbackService.listFeedback(params);
    res.json({ success: true, data: result });
  })
);

router.get(
  "/:feedbackId",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await adminFeedbackService.getFeedbackById(
      req.params.feedbackId
    );
    res.json({ success: true, data: result });
  })
);

export default router;
