import crypto from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../core/errors/app-error.js";
import { generatePresignedUploadUrl } from "../../infrastructure/aws/s3/s3.service.js";
import type {
  CompleteUploadInput,
  GetUploadUrlInput,
} from "./evidence.validation.js";

async function verifyIncidentOwnership(incidentId: string, userId: string) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    select: { reporterId: true, status: true },
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

export async function requestUploadUrl(
  incidentId: string,
  userId: string,
  input: GetUploadUrlInput
) {
  await verifyIncidentOwnership(incidentId, userId);

  const evidenceId = crypto.randomUUID();
  const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const s3Key = `incidents/${incidentId}/${evidenceId}-${sanitizedFileName}`;

  const uploadUrl = await generatePresignedUploadUrl(s3Key, input.contentType);

  return {
    evidenceId,
    uploadUrl,
    s3Key,
    expiresIn: 900,
  };
}

export async function completeEvidenceUpload(
  incidentId: string,
  userId: string,
  input: CompleteUploadInput
) {
  await verifyIncidentOwnership(incidentId, userId);

  const evidence = await prisma.evidence.create({
    data: {
      id: input.evidenceId,
      incidentId,
      type: input.type,
      s3Key: input.s3Key,
      fileName: input.s3Key.split("-").slice(1).join("-"),
      contentType: input.contentType,
      sizeBytes: 0,
      uploadedAt: new Date(),
    },
  });

  return {
    evidenceId: evidence.id,
    type: evidence.type,
  };
}
