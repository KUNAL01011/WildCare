import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../core/errors/app-error.js";
import type {
  CreateDispatchConfigInput,
  CreateResponderInput,
  CreateServiceAreaInput,
  VerifyOrganizationInput,
} from "./admin.validation.js";

// Helper to ensure the user is an admin
function verifyAdminRole(user: { id: string; role: string }) {
  if (user.role !== "ADMIN") {
    throw new AppError("FORBIDDEN", "Administrative access required", 403);
  }
}

export async function verifyOrganization(
  organizationId: string,
  adminUser: { id: string; role: string },
  input: VerifyOrganizationInput
) {
  verifyAdminRole(adminUser);

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new AppError("ORGANIZATION_NOT_FOUND", "Organization not found", 404);
  }

  const newStatus = input.decision === "APPROVED" ? "VERIFIED" : "REJECTED";

  const result = await prisma.$transaction(async tx => {
    // 1. Update Organization
    const updatedOrg = await tx.organization.update({
      where: { id: organizationId },
      data: {
        status: newStatus,
        reviewedById: adminUser.id,
        reviewNotes: input.reviewNotes,
        reviewedAt: new Date(),
      },
    });

    // 2. Create Verification Record
    await tx.verification.create({
      data: {
        organizationId,
        reviewerId: adminUser.id,
        status: input.decision === "APPROVED" ? "VERIFIED" : "REJECTED",
        notes: input.reviewNotes,
      },
    });

    // 3. Create Audit Log
    await tx.auditLog.create({
      data: {
        actorId: adminUser.id,
        action: "ORGANIZATION_VERIFIED",
        entityType: "ORGANIZATION",
        entityId: organizationId,
        metadata: { decision: input.decision, notes: input.reviewNotes },
      },
    });

    return updatedOrg;
  });

  return { organizationId: result.id, status: result.status };
}

export async function provisionResponder(
  adminUser: { id: string; role: string },
  input: CreateResponderInput
) {
  verifyAdminRole(adminUser);

  const org = await prisma.organization.findUnique({
    where: { id: input.organizationId },
  });

  if (!org)
    throw new AppError("ORGANIZATION_NOT_FOUND", "Organization not found", 404);

  const responder = await prisma.responderProfile.create({
    data: {
      organizationId: input.organizationId,
      displayName: input.displayName,
      dashboardEnabled: input.dashboardEnabled,
      status: input.active ? "ACTIVE" : "INACTIVE",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      action: "RESPONDER_PROVISIONED",
      entityType: "RESPONDER",
      entityId: responder.id,
    },
  });

  return responder;
}

export async function configureServiceArea(
  responderId: string,
  adminUser: { id: string; role: string },
  input: CreateServiceAreaInput
) {
  verifyAdminRole(adminUser);

  const serviceArea = await prisma.serviceArea.create({
    data: {
      responderId,
      name: input.name,
      type: input.type,
      district: input.district,
      state: input.state,
      active: true,
    },
  });

  return serviceArea;
}

export async function configureDispatchChannel(
  responderId: string,
  adminUser: { id: string; role: string },
  input: CreateDispatchConfigInput
) {
  verifyAdminRole(adminUser);

  const config = await prisma.dispatchConfiguration.create({
    data: {
      responderId,
      channel: input.channel,
      destination: input.destination,
      enabled: input.enabled,
      priority: input.priority,
    },
  });

  return config;
}
