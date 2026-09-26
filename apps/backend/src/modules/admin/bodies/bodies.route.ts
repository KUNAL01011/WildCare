import { Router, type Request, type Response } from "express";
import { asyncHandler } from "@/core/middleware/async-handler.middleware";
import {
  createBodySchema,
  updateBodySchema,
  updateVerificationSchema,
  listBodiesSchema,
} from "./bodies.schema";
import * as bodiesService from "./bodies.service";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const params = listBodiesSchema.parse(req.query);
    const result = await bodiesService.listBodies(params);
    res.json({ success: true, data: result });
  })
);

router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const data = createBodySchema.parse(req.body);
    const result = await bodiesService.createBody(data);
    res.status(201).json({ success: true, data: result });
  })
);

router.get(
  "/:bodyId",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await bodiesService.getBodyById(req.params.bodyId);
    res.json({ success: true, data: result });
  })
);

router.patch(
  "/:bodyId",
  asyncHandler(async (req: Request, res: Response) => {
    const data = updateBodySchema.parse(req.body);
    const result = await bodiesService.updateBody(req.params.bodyId, data);
    res.json({ success: true, data: result });
  })
);

router.patch(
  "/:bodyId/verification",
  asyncHandler(async (req: Request, res: Response) => {
    const { verificationStatus } = updateVerificationSchema.parse(req.body);
    const result = await bodiesService.updateVerification(
      req.params.bodyId,
      verificationStatus
    );
    res.json({ success: true, data: result });
  })
);

export default router;
