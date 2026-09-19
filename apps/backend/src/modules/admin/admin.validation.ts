import { z } from "zod";
import {
  OrganizationStatus,
  ServiceAreaType,
  DispatchChannel,
} from "../../generated/prisma/client.js";

export const verifyOrganizationSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  reviewNotes: z.string().min(1, "Review notes are required"),
});

export const createResponderSchema = z.object({
  organizationId: z.string().uuid(),
  displayName: z.string().min(2),
  dashboardEnabled: z.boolean(),
  active: z.boolean().default(true),
});

export const createServiceAreaSchema = z.object({
  name: z.string().min(2),
  type: z.nativeEnum(ServiceAreaType),
  district: z.string().optional(),
  state: z.string().optional(),
});

export const createDispatchConfigSchema = z.object({
  channel: z.nativeEnum(DispatchChannel),
  destination: z.string().min(1),
  enabled: z.boolean().default(true),
  priority: z.number().int().min(1).default(1),
});

export type VerifyOrganizationInput = z.infer<typeof verifyOrganizationSchema>;
export type CreateResponderInput = z.infer<typeof createResponderSchema>;
export type CreateServiceAreaInput = z.infer<typeof createServiceAreaSchema>;
export type CreateDispatchConfigInput = z.infer<
  typeof createDispatchConfigSchema
>;
