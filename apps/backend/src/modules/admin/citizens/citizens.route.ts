import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { asyncHandler } from "@/core/middleware/async-handler.middleware";
import * as citizensService from "./citizens.service";

const listSchema = z.object({
  search: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

const router = Router();

router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const params = listSchema.parse(req.query);
    const result = await citizensService.listCitizens(params);
    res.json({ success: true, data: result });
  })
);

router.get(
  "/:userId",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await citizensService.getCitizenById(req.params.userId);
    res.json({ success: true, data: result });
  })
);

export default router;
