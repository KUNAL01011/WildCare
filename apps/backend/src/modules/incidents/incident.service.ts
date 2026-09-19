import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../core/errors/app-error.js";
import type {
  CreateIncidentInput,
  ResolveInput,
  UpdateStatusInput,
} from "./incident.validation.js";

export async function createIncident(
  userId: string,
  input: CreateIncidentInput
) {
  // Generate a short public ID for reporting
  const publicId = `WC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const incident = await prisma.incident.create({
    data: {
      reporterId: userId,
      publicId,
      incidentType: input.incidentType,
      description: input.description,
      latitude: input.latitude,
      longitude: input.longitude,
      locationAccuracy: input.locationAccuracy,
      status: "DRAFT",
      urgency: "UNKNOWN",
    },
  });

  return { incidentId: incident.id, status: incident.status };
}

export async function getIncident(
  incidentId: string,
  user: { id: string; role: string }
) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: { evidence: true, aiAnalysis: true },
  });

  if (!incident) {
    throw new AppError("INCIDENT_NOT_FOUND", "Incident not found", 404);
  }

  // Authorization: Citizens only see their own, Responders only see assigned
  if (user.role === "CITIZEN" && incident.reporterId !== user.id) {
    throw new AppError("FORBIDDEN", "Access denied", 403);
  }

  if (user.role === "RESPONDER") {
    const responder = await prisma.responderProfile.findUnique({
      where: { userId: user.id },
    });
    if (!responder || incident.selectedResponderId !== responder.id) {
      throw new AppError(
        "FORBIDDEN",
        "Access denied. Incident not assigned to you.",
        403
      );
    }
  }

  return incident;
}

export async function getCitizenIncidents(userId: string) {
  return await prisma.incident.findMany({
    where: { reporterId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      publicId: true,
      incidentType: true,
      status: true,
      createdAt: true,
      urgency: true,
    },
  });
}

async function verifyResponderAccess(incidentId: string, userId: string) {
  const responder = await prisma.responderProfile.findUnique({
    where: { userId },
  });
  if (!responder) {
    throw new AppError("FORBIDDEN", "Not a valid responder profile", 403);
  }

  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
  });
  if (!incident || incident.selectedResponderId !== responder.id) {
    throw new AppError(
      "FORBIDDEN",
      "Incident not assigned to your organization",
      403
    );
  }
  return { incident, responder };
}

export async function acknowledgeIncident(incidentId: string, userId: string) {
  await verifyResponderAccess(incidentId, userId);

  await prisma.incident.update({
    where: { id: incidentId },
    data: { status: "ACKNOWLEDGED" },
  });

  return { incidentId, status: "ACKNOWLEDGED" };
}

export async function acceptIncident(incidentId: string, userId: string) {
  await verifyResponderAccess(incidentId, userId);

  await prisma.incident.update({
    where: { id: incidentId },
    data: { status: "ACCEPTED" },
  });

  return { incidentId, status: "ACCEPTED" };
}

export async function resolveIncident(
  incidentId: string,
  userId: string,
  input: ResolveInput
) {
  await verifyResponderAccess(incidentId, userId);

  await prisma.$transaction(async tx => {
    await tx.incident.update({
      where: { id: incidentId },
      data: { status: "RESOLVED" },
    });

    await tx.incidentStatusHistory.create({
      data: {
        incidentId,
        actorId: userId,
        toStatus: "RESOLVED",
        note: input.resolutionNote,
      },
    });
  });

  return { incidentId, status: "RESOLVED" };
}
