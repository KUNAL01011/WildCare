import { z } from "zod";

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
});
