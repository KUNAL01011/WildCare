import { z } from "zod";

export const getNotificationsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});

export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>;
