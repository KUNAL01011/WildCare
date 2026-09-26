import { prisma } from "@/infrastructure/database/prisma";
import { AppError } from "@/core/errors/app-error";

const orm = (prisma as any).orm.public;

export async function submitFeedback(
  reportId: string,
  userId: string,
  data: {
    bodyId: string;
    overallRating: number;
    responseTimeRating: number;
    professionalismRating: number;
    outcome: string;
    comment?: string;
  }
) {
  const report = await orm.Report.where({ id: reportId, userId }).first();

  if (!report) {
    throw new AppError("REPORT_NOT_FOUND", "Report not found", 404);
  }

  const existing = await orm.Feedback.where({ reportId, userId }).first();

  if (existing) {
    throw new AppError(
      "FEEDBACK_ALREADY_EXISTS",
      "Feedback already submitted for this report",
      409
    );
  }

  const feedback = await orm.Feedback.create({
    reportId,
    bodyId: data.bodyId,
    userId,
    overallRating: data.overallRating,
    responseTimeRating: data.responseTimeRating,
    professionalismRating: data.professionalismRating,
    outcome: data.outcome,
    comment: data.comment ?? null,
  });

  await orm.ReportEvent.create({
    reportId,
    type: "FEEDBACK_SUBMITTED",
    description: `Feedback submitted (rating: ${data.overallRating}/5)`,
    actorType: "CITIZEN",
    actorId: userId,
  });

  return { feedbackId: feedback.id };
}
