import { prisma } from "../../lib/prisma.js";
import type { ApplyOrganizationInput } from "./organization.validation.js";

export async function applyOrganization(input: ApplyOrganizationInput) {
  const organization = await prisma.organization.create({
    data: {
      name: input.name,
      type: input.type,
      description: input.description,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      credentials: input.credentials,
      status: "PENDING",
    },
  });

  return {
    organizationId: organization.id,
    status: organization.status,
  };
}
