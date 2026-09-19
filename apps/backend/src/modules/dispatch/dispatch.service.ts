import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../core/errors/app-error.js";
import { EmailDispatchProvider } from "./providers/email.provider.js";
import {
  IDispatchProvider,
  DispatchPayload,
} from "./providers/dispatch.provider.js";
import type { RetryDispatchInput } from "./dispatch.validation.js";

// Factory for getting the correct provider based on channel
function getDispatchProvider(channel: string): IDispatchProvider {
  switch (channel) {
    case "EMAIL":
      return new EmailDispatchProvider();
    // Cases for SMS, WHATSAPP, VOICE, WEBHOOK go here
    default:
      throw new Error(
        `Dispatch provider not implemented for channel: ${channel}`
      );
  }
}

export async function getDispatchHistory(
  incidentId: string,
  user: { id: string; role: string }
) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    select: { selectedResponderId: true },
  });

  if (!incident) {
    throw new AppError("INCIDENT_NOT_FOUND", "Incident not found", 404);
  }

  // Responders can only view dispatch history for incidents assigned to them
  if (user.role === "RESPONDER") {
    const responder = await prisma.responderProfile.findUnique({
      where: { userId: user.id },
    });
    if (!responder || incident.selectedResponderId !== responder.id) {
      throw new AppError(
        "FORBIDDEN",
        "Not authorized to view this incident's dispatch history",
        403
      );
    }
  }

  return await prisma.dispatchAttempt.findMany({
    where: { incidentId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Core dispatch execution. This is primarily called by the SQS worker.
 */
export async function executeDispatch(
  incidentId: string,
  responderId: string,
  channel: string
) {
  const config = await prisma.dispatchConfiguration.findUnique({
    where: {
      responderId_channel_destination: {
        // Requires unique constraint in schema
        responderId,
        channel: channel as any,
        destination: "", // Simplified for MVP. In reality, you'd fetch the exact config
      },
    },
  });

  // For MVP simplification, just fetch the first active config for this channel
  const activeConfig = await prisma.dispatchConfiguration.findFirst({
    where: { responderId, channel: channel as any, enabled: true },
  });

  if (!activeConfig) {
    throw new AppError(
      "DISPATCH_CONFIGURATION_NOT_FOUND",
      "No active configuration for this channel",
      422
    );
  }

  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
  });

  if (!incident)
    throw new AppError("INCIDENT_NOT_FOUND", "Incident not found", 404);

  // 1. Record Attempt as QUEUED/SENDING
  const attempt = await prisma.dispatchAttempt.create({
    data: {
      incidentId,
      responderId,
      channel: channel as any,
      status: "SENDING",
      destination: activeConfig.destination,
      attemptNumber: 1, // Logic to increment based on existing attempts goes here
    },
  });

  const payload: DispatchPayload = {
    incidentId: incident.publicId,
    incidentType: incident.incidentType,
    urgency: incident.urgency,
    destination: activeConfig.destination,
    description: incident.description,
    locationLink: `https://dashboard.wildcare.in/incidents/${incident.id}`,
  };

  const provider = getDispatchProvider(channel);
  const result = await provider.send(payload);

  // 2. Update Attempt and Incident Status
  await prisma.$transaction(async tx => {
    await tx.dispatchAttempt.update({
      where: { id: attempt.id },
      data: {
        status: result.success ? "SENT" : "FAILED",
        providerMessageId: result.providerMessageId,
        failureReason: result.error,
        sentAt: result.success ? new Date() : null,
      },
    });

    if (result.success) {
      await tx.incident.update({
        where: { id: incidentId },
        data: { status: "DISPATCHED" },
      });

      await tx.incidentStatusHistory.create({
        data: {
          incidentId,
          toStatus: "DISPATCHED",
          note: `Successfully dispatched via ${channel}`,
        },
      });
    }
  });

  return {
    attemptId: attempt.id,
    success: result.success,
    error: result.error,
  };
}

export async function retryDispatch(
  incidentId: string,
  input: RetryDispatchInput
) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    select: { selectedResponderId: true },
  });

  if (!incident || !incident.selectedResponderId) {
    throw new AppError(
      "INCIDENT_NOT_FOUND",
      "Incident not found or unassigned",
      404
    );
  }

  // Push to SQS Queue (simplified for now by calling execute directly)
  // In a real implementation, you send `{ incidentId, responderId, channel }` to SQS here
  await executeDispatch(
    incidentId,
    incident.selectedResponderId,
    input.channel
  );

  return { status: "QUEUED" };
}
