import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { asyncHandler } from "@/core/middleware/async-handler.middleware";
import * as locationsService from "./locations.service";

const summarySchema = z.object({
  state: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

const router = Router();

router.get(
  "/states",
  asyncHandler(async (_req: Request, res: Response) => {
    const states = await locationsService.getStates();
    res.json({ success: true, data: states });
  })
);

router.get(
  "/states/:state/districts",
  asyncHandler(async (req: Request, res: Response) => {
    const districts = await locationsService.getDistricts(req.params.state);
    res.json({ success: true, data: districts });
  })
);

router.get(
  "/districts/:district/cities",
  asyncHandler(async (req: Request, res: Response) => {
    const cities = await locationsService.getCities(req.params.district);
    res.json({ success: true, data: cities });
  })
);

router.get(
  "/summary",
  asyncHandler(async (req: Request, res: Response) => {
    const params = summarySchema.parse(req.query);
    const summary = await locationsService.getLocationSummary(params);
    res.json({ success: true, data: summary });
  })
);

export default router;
