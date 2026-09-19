import type { Request, Response } from "express";
import { asyncHandler } from "../../core/middleware/async-handler.middleware.js";
import { applyOrganizationSchema } from "./organization.validation.js";
import { applyOrganization } from "./organization.service.js";

export const applyOrganizationController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = applyOrganizationSchema.parse(req.body);
    const result = await applyOrganization(input);
    res.status(201).json({ success: true, data: result });
  }
);
