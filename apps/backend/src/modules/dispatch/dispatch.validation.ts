import { z } from "zod";
import { DispatchChannel } from "../../generated/prisma/client.js";

export const retryDispatchSchema = z.object({
  channel: z.nativeEnum(DispatchChannel),
});

export type RetryDispatchInput = z.infer<typeof retryDispatchSchema>;
