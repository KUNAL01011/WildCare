import type { Request, Response } from "express";
import { asyncHandler } from "../../core/middleware/async-handler.middleware.js";
import { createIncidentSchema, resolveSchema } from "./incident.validation.js";
import {
  acceptIncident,
  acknowledgeIncident,
  createIncident,
  getCitizenIncidents,
  getIncident,
  resolveIncident,
} from "./incident.service.js";

export const createIncidentController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createIncidentSchema.parse(req.body);
    const result = await createIncident(req.user!.id, input);
    res.status(201).json({ success: true, data: result });
  }
);

export const getIncidentController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getIncident(req.params.id as string, req.user!);
    res.status(200).json({ success: true, data: result });
  }
);

export const listMyIncidentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getCitizenIncidents(req.user!.id);
    res.status(200).json({ success: true, data: { items: result } });
  }
);

export const acknowledgeIncidentController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await acknowledgeIncident(
      req.params.id as string,
      req.user!.id
    );
    res.status(200).json({ success: true, data: result });
  }
);

export const acceptIncidentController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await acceptIncident(req.params.id as string, req.user!.id);
    res.status(200).json({ success: true, data: result });
  }
);

export const resolveIncidentController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = resolveSchema.parse(req.body);
    const result = await resolveIncident(
      req.params.id as string,
      req.user!.id,
      input
    );
    res.status(200).json({ success: true, data: result });
  }
);
