import { z } from "zod";
import { IncidentType, IncidentStatus } from "../../generated/prisma/client.js";

export const createIncidentSchema = z.object({
  incidentType: z.nativeEnum(IncidentType),
  description: z.string().min(1, "Description is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationAccuracy: z.number().optional(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(IncidentStatus),
  note: z.string().optional(),
});

export const resolveSchema = z.object({
  resolutionNote: z.string().min(1, "Resolution note is required"),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ResolveInput = z.infer<typeof resolveSchema>;
