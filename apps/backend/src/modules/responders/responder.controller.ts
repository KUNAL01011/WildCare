import type { Request, Response } from "express";
import { asyncHandler } from "../../core/middleware/async-handler.middleware.js";
import { getResponderIncidentsSchema } from "./responder.validation.js";
import { getMeResponder, getResponderIncidents } from "./responder.service.js";
import { AppError } from "../../core/errors/app-error.js";

// Helper to ensure role is RESPONDER
function requireResponderRole(req: Request) {
  if (req.user!.role !== "RESPONDER") {
    throw new AppError(
      "FORBIDDEN",
      "Only responders can access this resource",
      403
    );
  }
}

export const getMeResponderController = asyncHandler(
  async (req: Request, res: Response) => {
    requireResponderRole(req);
    const result = await getMeResponder(req.user!.id);
    res.status(200).json({ success: true, data: result });
  }
);

export const getResponderIncidentsController = asyncHandler(
  async (req: Request, res: Response) => {
    requireResponderRole(req);
    const input = getResponderIncidentsSchema.parse(req.query);
    const result = await getResponderIncidents(req.user!.id, input);
    res.status(200).json({ success: true, data: result });
  }
);
