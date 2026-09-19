import type { Request, Response } from "express";
import { asyncHandler } from "../../core/middleware/async-handler.middleware.js";
import { retryDispatchSchema } from "./dispatch.validation.js";
import { getDispatchHistory, retryDispatch } from "./dispatch.service.js";

export const getDispatchHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getDispatchHistory(req.params.id as string, req.user!);
    res.status(200).json({ success: true, data: { items: result } });
  }
);

export const retryDispatchController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = retryDispatchSchema.parse(req.body);
    const result = await retryDispatch(req.params.id as string, input);
    res.status(202).json({ success: true, data: result });
  }
);
