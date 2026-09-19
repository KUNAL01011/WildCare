import { z } from "zod";
import { IncidentStatus } from "../../generated/prisma/client.js";

export const getResponderIncidentsSchema = z.object({
  status: z.nativeEnum(IncidentStatus).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});

export type GetResponderIncidentsInput = z.infer<
  typeof getResponderIncidentsSchema
>;
