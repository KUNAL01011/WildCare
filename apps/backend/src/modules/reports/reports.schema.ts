import { z } from "zod";

export const listReportsSchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const updateReportSchema = z.object({
  animalName: z.string().optional(),
  citizenCondition: z.string().optional(),
  severity: z.string().optional(),
  description: z.string().optional(),
});

export const updateResponseStatusSchema = z.object({
  status: z.enum([
    "WAITING",
    "RESPONDER_CONTACTED",
    "RESPONDER_ACCEPTED",
    "IN_PROGRESS",
    "RESOLVED",
    "UNABLE_TO_REACH_RESPONDER",
  ]),
});

export const contactAttemptSchema = z.object({
  bodyId: z.string().min(1),
  type: z.enum(["PHONE"]).default("PHONE"),
});
