import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../core/errors/app-error.js";
import type { CreateAssignmentInput } from "./assignment.validation.js";

async function verifyIncidentOwnership(incidentId: string, userId: string) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
  });

  if (!incident) {
    throw new AppError("INCIDENT_NOT_FOUND", "Incident not found", 404);
  }

  if (incident.reporterId !== userId) {
    throw new AppError(
      "FORBIDDEN",
      "You do not have access to this incident",
      403
    );
  }

  return incident;
}

export async function findEligibleResponders(
  incidentId: string,
  userId: string
) {
  const incident = await verifyIncidentOwnership(incidentId, userId);

  // MVP Routing: District/State based matching rather than complex GIS point-in-polygon
  const serviceAreas = await prisma.serviceArea.findMany({
    where: {
      active: true,
      OR: [{ district: incident.district }, { state: incident.state }],
      responder: {
        active: true,
        organization: {
          status: "VERIFIED",
        },
      },
    },
    include: {
      responder: {
        include: {
          organization: {
            select: { name: true },
          },
          dispatchConfigurations: {
            where: { enabled: true },
            select: { channel: true },
          },
        },
      },
    },
  });

  // Deduplicate responders in case multiple service areas match
  const uniqueResponders = new Map();

  for (const area of serviceAreas) {
    const r = area.responder;
    if (!uniqueResponders.has(r.id)) {
      uniqueResponders.set(r.id, {
        responderId: r.id,
        organizationName: r.organization.name,
        displayName: r.displayName,
        serviceArea: area.name,
        availableChannels: r.dispatchConfigurations.map(dc => dc.channel),
      });
    }
  }

  return Array.from(uniqueResponders.values());
}

export async function assignResponder(
  incidentId: string,
  userId: string,
  input: CreateAssignmentInput
) {
  const incident = await verifyIncidentOwnership(incidentId, userId);

  if (
    incident.status !== "AWAITING_RESPONDER_SELECTION" &&
    incident.status !== "DRAFT"
  ) {
    throw new AppError(
      "INCIDENT_INVALID_STATE",
      "Incident is not in a valid state for assignment",
      422
    );
  }

  const responder = await prisma.responderProfile.findUnique({
    where: { id: input.responderId },
    include: { organization: true },
  });

  if (
    !responder ||
    !responder.active ||
    responder.organization.status !== "VERIFIED"
  ) {
    throw new AppError(
      "RESPONDER_NOT_ELIGIBLE",
      "Selected responder is not available or verified",
      422
    );
  }

  // Use interactive transaction to guarantee assignment creation and status update are atomic
  const result = await prisma.$transaction(async tx => {
    const assignment = await tx.incidentAssignment.create({
      data: {
        incidentId,
        responderId: input.responderId,
        status: "SELECTED",
      },
    });

    const updatedIncident = await tx.incident.update({
      where: { id: incidentId },
      data: {
        selectedResponderId: input.responderId,
        status: "DISPATCHING",
      },
    });

    await tx.incidentStatusHistory.create({
      data: {
        incidentId,
        actorId: userId,
        toStatus: "DISPATCHING",
        note: `Citizen selected responder: ${responder.displayName}`,
      },
    });

    return { assignment, updatedIncident };
  });

  // Note: In the complete flow, this step would also push a message to SQS to trigger the Dispatch worker.

  return {
    incidentId,
    responderId: input.responderId,
    status: result.updatedIncident.status,
  };
}
