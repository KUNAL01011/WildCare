import { z } from "zod";

export const submitFeedbackSchema = z.object({
  bodyId: z.string().min(1),
  overallRating: z.number().int().min(1).max(5),
  responseTimeRating: z.number().int().min(1).max(5),
  professionalismRating: z.number().int().min(1).max(5),
  outcome: z.enum([
    "SUCCESSFUL",
    "PARTIALLY_SUCCESSFUL",
    "UNSUCCESSFUL",
    "UNKNOWN",
  ]),
  comment: z.string().optional(),
});
