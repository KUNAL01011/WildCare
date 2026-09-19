import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../core/errors/app-error.js";
import { analyzeWildlifeIncident } from "../../infrastructure/aws/bedrock/bedrock.service.js";

export async function processIncidentAnalysis(
  incidentId: string,
  userId: string
) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: { evidence: true, aiAnalysis: true },
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

  // Idempotency: Prevent running analysis twice on the same incident
  if (incident.aiAnalysis && incident.aiAnalysis.status === "COMPLETED") {
    return {
      incidentId,
      analysisId: incident.aiAnalysis.id,
      status: incident.status,
      analysis: incident.aiAnalysis,
    };
  }

  try {
    // 1. Call Bedrock
    const evidenceKeys = incident.evidence.map(e => e.s3Key);
    const aiResult = await analyzeWildlifeIncident(
      incident.description,
      evidenceKeys
    );

    // 2. Save Analysis and Update Incident Status in a Transaction
    const result = await prisma.$transaction(async tx => {
      const analysis = await tx.aIAnalysis.upsert({
        where: { incidentId },
        create: {
          incidentId,
          status: "COMPLETED",
          modelId: process.env.BEDROCK_MODEL_ID || "claude-3",
          speciesGuess: aiResult.speciesGuess,
          incidentAssessment: aiResult.incidentAssessment,
          urgency: aiResult.urgency,
          confidence: aiResult.confidence,
          visibleIndicators: aiResult.visibleIndicators,
          safetyGuidance: aiResult.safetyGuidance,
          summary: aiResult.summary,
          rawResponse: aiResult.rawResponse,
          analyzedAt: new Date(),
        },
        update: {
          status: "COMPLETED",
          speciesGuess: aiResult.speciesGuess,
          incidentAssessment: aiResult.incidentAssessment,
          urgency: aiResult.urgency,
          confidence: aiResult.confidence,
          visibleIndicators: aiResult.visibleIndicators,
          safetyGuidance: aiResult.safetyGuidance,
          summary: aiResult.summary,
          rawResponse: aiResult.rawResponse,
          analyzedAt: new Date(),
        },
      });

      const updatedIncident = await tx.incident.update({
        where: { id: incidentId },
        data: {
          status: "AWAITING_RESPONDER_SELECTION",
          urgency: aiResult.urgency,
        },
      });

      return { analysis, updatedIncident };
    });

    return {
      incidentId,
      analysisId: result.analysis.id,
      status: result.updatedIncident.status,
      analysis: result.analysis,
    };
  } catch (error) {
    // Record failure without breaking the citizen flow
    await prisma.aIAnalysis.upsert({
      where: { incidentId },
      create: {
        incidentId,
        status: "FAILED",
        failureReason: (error as Error).message,
      },
      update: { status: "FAILED", failureReason: (error as Error).message },
    });

    // Move to next status anyway so citizen isn't blocked by AI failure
    await prisma.incident.update({
      where: { id: incidentId },
      data: { status: "AWAITING_RESPONDER_SELECTION" },
    });

    throw new AppError(
      "AI_ANALYSIS_FAILED",
      "AI analysis failed but incident can proceed manually",
      500
    );
  }
}
