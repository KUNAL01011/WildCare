import type { Request, Response } from "express";
import { asyncHandler } from "../../core/middleware/async-handler.middleware.js";
import { processIncidentAnalysis } from "./ai-analysis.service.js";

export const analyzeIncidentController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await processIncidentAnalysis(
      req.params.id as string,
      req.user!.id
    );
    res.status(200).json({ success: true, data: result });
  }
);
