import { z } from "zod";

export const createBodySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["GOVERNMENT", "NGO", "PRIVATE"]),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  services: z
    .array(
      z.enum([
        "WILDLIFE_RESCUE",
        "INJURED_ANIMAL",
        "TRAPPED_ANIMAL",
        "DEAD_ANIMAL",
        "VETERINARY_SUPPORT",
        "EMERGENCY_RESPONSE",
      ])
    )
    .optional(),
  animalTypes: z.array(z.string()).optional(),
});

export const updateBodySchema = createBodySchema.partial();

export const updateVerificationSchema = z.object({
  verificationStatus: z.enum([
    "PENDING",
    "UNDER_REVIEW",
    "VERIFIED",
    "REJECTED",
    "SUSPENDED",
  ]),
});

export const listBodiesSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  verificationStatus: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});
