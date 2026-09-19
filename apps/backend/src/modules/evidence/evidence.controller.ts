import type { Request, Response } from "express";
import { asyncHandler } from "../../core/middleware/async-handler.middleware.js";
import {
  completeUploadSchema,
  getUploadUrlSchema,
} from "./evidence.validation.js";
import {
  completeEvidenceUpload,
  requestUploadUrl,
} from "./evidence.service.js";

export const getUploadUrlController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = getUploadUrlSchema.parse(req.body);
    const result = await requestUploadUrl(
      req.params.id as string,
      req.user!.id,
      input
    );
    res.status(200).json({ success: true, data: result });
  }
);

export const completeUploadController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = completeUploadSchema.parse(req.body);
    const result = await completeEvidenceUpload(
      req.params.id as string,
      req.user!.id,
      input
    );
    res.status(201).json({ success: true, data: result });
  }
);
