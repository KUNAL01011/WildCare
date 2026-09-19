import { z } from "zod";
import { OrganizationType } from "../../generated/prisma/client.js";

export const applyOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  type: z.nativeEnum(OrganizationType),
  description: z.string().optional(),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Valid phone number is required"),
  credentials: z.string().optional(),
});

export type ApplyOrganizationInput = z.infer<typeof applyOrganizationSchema>;
