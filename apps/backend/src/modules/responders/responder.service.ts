import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../core/errors/app-error.js";
import type { GetResponderIncidentsInput } from "./responder.validation.js";

async function getResponderProfileForUser(userId: string) {
  const responder = await prisma.responderProfile.findUnique({
    where: { userId },
    include: { organization: true },
  });

  if (!responder) {
    throw new AppError(
      "RESPONDER_NOT_FOUND",
      "Responder profile not found for this user",
      404
    );
  }

  return responder;
}

export async function getMeResponder(userId: string) {
  const responder = await getResponderProfileForUser(userId);

  return {
    responderId: responder.id,
    organizationId: responder.organizationId,
    displayName: responder.displayName,
    dashboardEnabled: responder.dashboardEnabled,
    active: responder.active,
    organization: {
      name: responder.organization.name,
      type: responder.organization.type,
      status: responder.organization.status,
    },
  };
}

export async function getResponderIncidents(
  userId: string,
  input: GetResponderIncidentsInput
) {
  const responder = await getResponderProfileForUser(userId);

  const incidents = await prisma.incident.findMany({
    where: {
      selectedResponderId: responder.id,
      ...(input.status ? { status: input.status } : {}),
    },
    take: input.limit + 1, // Fetch one extra to determine if there's a next page
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      publicId: true,
      incidentType: true,
      urgency: true,
      status: true,
      district: true,
      createdAt: true,
    },
  });

  let nextCursor: string | null = null;
  if (incidents.length > input.limit) {
    const nextItem = incidents.pop();
    nextCursor = nextItem!.id;
  }

  return { items: incidents, nextCursor };
}
