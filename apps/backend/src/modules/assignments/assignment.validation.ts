import { z } from "zod";

export const createAssignmentSchema = z.object({
  responderId: z.string().uuid("Invalid responder ID format"),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
