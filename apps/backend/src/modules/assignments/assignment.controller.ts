import type { Request, Response } from "express";
import { asyncHandler } from "../../core/middleware/async-handler.middleware.js";
import { createAssignmentSchema } from "./assignment.validation.js";
import {
  assignResponder,
  findEligibleResponders,
} from "./assignment.service.js";

export const getEligibleRespondersController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await findEligibleResponders(
      req.params.id as string,
      req.user!.id
    );
    res.status(200).json({ success: true, data: { items: result } });
  }
);

export const createAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createAssignmentSchema.parse(req.body);
    const result = await assignResponder(
      req.params.id as string,
      req.user!.id,
      input
    );

    // Return 202 Accepted because dispatching occurs asynchronously
    res.status(202).json({ success: true, data: result });
  }
);
