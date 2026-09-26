import { prisma } from "@/infrastructure/database/prisma";
import { AppError } from "@/core/errors/app-error";

const orm = (prisma as any).orm.public;

export async function listFeedback(opts: {
  bodyId?: string;
  bodyType?: string;
  state?: string;
  district?: string;
  city?: string;
  rating?: number;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}) {
  let allFeedback = await orm.Feedback
    .orderBy((f: any) => f.createdAt.desc())
    .all();

  // Apply simple filters
  if (opts.bodyId) allFeedback = allFeedback.filter((f: any) => f.bodyId === opts.bodyId);
  if (opts.rating) allFeedback = allFeedback.filter((f: any) => f.overallRating === opts.rating);
  if (opts.from) {
    allFeedback = allFeedback.filter(
      (f: any) => new Date(f.createdAt) >= new Date(opts.from!)
    );
  }
  if (opts.to) {
    allFeedback = allFeedback.filter(
      (f: any) => new Date(f.createdAt) <= new Date(opts.to!)
    );
  }

  // Fetch related bodies, users, and reports for mapping
  const bodyIds = [...new Set(allFeedback.map((f: any) => f.bodyId).filter(Boolean))];
  const userIds = [...new Set(allFeedback.map((f: any) => f.userId).filter(Boolean))];
  const reportIds = [...new Set(allFeedback.map((f: any) => f.reportId).filter(Boolean))];

  const [bodies, users, reports] = await Promise.all([
    bodyIds.length > 0
      ? orm.ResponderBody.where((b: any) => b.id.in(bodyIds)).all()
      : Promise.resolve([]),
    userIds.length > 0
      ? orm.User.where((u: any) => u.id.in(userIds)).all()
      : Promise.resolve([]),
    reportIds.length > 0
      ? orm.Report.where((r: any) => r.id.in(reportIds)).all()
      : Promise.resolve([]),
  ]);

  const bodiesMap = new Map<string, any>();
  for (const b of bodies) bodiesMap.set(b.id, b);
  const usersMap = new Map<string, any>();
  for (const u of users) usersMap.set(u.id, u);
  const reportsMap = new Map<string, any>();
  for (const r of reports) reportsMap.set(r.id, r);

  // Apply bodyType filter (requires body data)
  if (opts.bodyType) {
    allFeedback = allFeedback.filter(
      (f: any) => bodiesMap.get(f.bodyId)?.type === opts.bodyType
    );
  }

  const total = allFeedback.length;
  const skip = (opts.page - 1) * opts.limit;
  const feedbacks = allFeedback.slice(skip, skip + opts.limit);

  return {
    feedback: feedbacks.map((f: any) => ({
      id: f.id,
      reportNumber: reportsMap.get(f.reportId)?.reportNumber,
      bodyName: bodiesMap.get(f.bodyId)?.name,
      bodyType: bodiesMap.get(f.bodyId)?.type,
      citizenName: usersMap.get(f.userId)?.name,
      overallRating: f.overallRating,
      responseTimeRating: f.responseTimeRating,
      professionalismRating: f.professionalismRating,
      outcome: f.outcome,
      comment: f.comment,
      location: {
        city: reportsMap.get(f.reportId)?.city,
        state: reportsMap.get(f.reportId)?.state,
      },
      createdAt: f.createdAt,
    })),
    total,
    page: opts.page,
  };
}

export async function getFeedbackById(feedbackId: string) {
  const feedback = await orm.Feedback.where({ id: feedbackId }).first();

  if (!feedback) {
    throw new AppError("RESOURCE_NOT_FOUND", "Feedback not found", 404);
  }

  const [body, user, report] = await Promise.all([
    feedback.bodyId
      ? orm.ResponderBody.where({ id: feedback.bodyId }).first()
      : Promise.resolve(null),
    feedback.userId
      ? orm.User.where({ id: feedback.userId }).first()
      : Promise.resolve(null),
    feedback.reportId
      ? orm.Report.where({ id: feedback.reportId }).first()
      : Promise.resolve(null),
  ]);

  return {
    id: feedback.id,
    overallRating: feedback.overallRating,
    responseTimeRating: feedback.responseTimeRating,
    professionalismRating: feedback.professionalismRating,
    outcome: feedback.outcome,
    comment: feedback.comment,
    body: body
      ? { id: body.id, name: body.name, type: body.type }
      : null,
    citizen: user
      ? { id: user.id, name: user.name, email: user.email }
      : null,
    report: report
      ? {
          id: report.id,
          reportNumber: report.reportNumber,
          animalName: report.animalName,
          city: report.city,
          state: report.state,
          status: report.status,
        }
      : null,
    createdAt: feedback.createdAt,
  };
}
