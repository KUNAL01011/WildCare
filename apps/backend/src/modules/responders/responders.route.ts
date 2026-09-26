import { Router, type Request, type Response } from "express";
import { asyncHandler } from "@/core/middleware/async-handler.middleware";
import { authenticateMiddleware } from "@/core/middleware/auth.middleware";
import * as respondersService from "./responders.service";

const router = Router();

// GET /responders/:bodyId - public responder profile (still needs auth)
router.get(
  "/:bodyId",
  authenticateMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await respondersService.getResponderById(req.params.bodyId);
    res.json({ success: true, data: result });
  })
);

export default router;
