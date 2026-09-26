import { prisma } from "@/infrastructure/database/prisma";
import { AppError } from "@/core/errors/app-error";
import { deleteFiles } from "@/infrastructure/storage/storage.service";

const orm = (prisma as any).orm.public;

export async function listReports(opts: {
  search?: string;
  status?: string;
  animal?: string;
  condition?: string;
  state?: string;
  district?: string;
  city?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}) {
  let allReports = await orm.Report
    .orderBy((r: any) => r.createdAt.desc())
    .all();

  // Apply filters in JS
  if (opts.search) {
    const searchLower = opts.search.toLowerCase();
    allReports = allReports.filter(
      (r: any) =>
        r.reportNumber?.toLowerCase().includes(searchLower) ||
        r.animalName?.toLowerCase().includes(searchLower)
    );
  }
  if (opts.status) allReports = allReports.filter((r: any) => r.status === opts.status);
  if (opts.animal) {
    const animalLower = opts.animal.toLowerCase();
    allReports = allReports.filter((r: any) =>
      r.animalName?.toLowerCase().includes(animalLower)
    );
  }
  if (opts.condition) {
    allReports = allReports.filter((r: any) => r.citizenCondition === opts.condition);
  }
  if (opts.state) allReports = allReports.filter((r: any) => r.state === opts.state);
  if (opts.district) allReports = allReports.filter((r: any) => r.district === opts.district);
  if (opts.city) allReports = allReports.filter((r: any) => r.city === opts.city);
  if (opts.from) {
    allReports = allReports.filter(
      (r: any) => new Date(r.createdAt) >= new Date(opts.from!)
    );
  }
  if (opts.to) {
    allReports = allReports.filter(
      (r: any) => new Date(r.createdAt) <= new Date(opts.to!)
    );
  }

  const total = allReports.length;
  const skip = (opts.page - 1) * opts.limit;
  const reports = allReports.slice(skip, skip + opts.limit);

  // Fetch user info and first image for paginated reports
  const reportIds = reports.map((r: any) => r.id);
  const userIds = [...new Set(reports.map((r: any) => r.userId).filter(Boolean))];

  const usersMap = new Map<string, any>();
  const imagesByReport = new Map<string, string>();

  if (reportIds.length > 0) {
    const [users, images] = await Promise.all([
      userIds.length > 0
        ? orm.User.where((u: any) => u.id.in(userIds)).all()
        : Promise.resolve([]),
      orm.ReportImage
        .where((i: any) => i.reportId.in(reportIds))
        .orderBy((i: any) => i.sortOrder.asc())
        .all(),
    ]);

    for (const u of users) usersMap.set(u.id, u);
    for (const img of images) {
      if (!imagesByReport.has(img.reportId)) {
        imagesByReport.set(img.reportId, img.url);
      }
    }
  }

  return {
    reports: reports.map((r: any) => ({
      id: r.id,
      reportNumber: r.reportNumber,
      status: r.status,
      animalName: r.animalName,
      severity: r.severity,
      citizenCondition: r.citizenCondition,
      location: { city: r.city, state: r.state, district: r.district },
      citizenName: usersMap.get(r.userId)?.name,
      citizenEmail: usersMap.get(r.userId)?.email,
      imageUrl: imagesByReport.get(r.id),
      createdAt: r.createdAt,
      submittedAt: r.submittedAt,
    })),
    total,
    page: opts.page,
  };
}

export async function getReportById(reportId: string) {
  const report = await orm.Report.where({ id: reportId }).first();

  if (!report) {
    throw new AppError("REPORT_NOT_FOUND", "Report not found", 404);
  }

  // Fetch all related data separately
  const [user, images, aiAnalyses, events, contacts, feedbacks, matches] =
    await Promise.all([
      report.userId
        ? orm.User.where({ id: report.userId }).first()
        : Promise.resolve(null),
      orm.ReportImage
        .where({ reportId })
        .orderBy((i: any) => i.sortOrder.asc())
        .all(),
      orm.AIAnalysis
        .where({ reportId })
        .orderBy((a: any) => a.createdAt.desc())
        .all(),
      orm.ReportEvent
        .where({ reportId })
        .orderBy((e: any) => e.createdAt.asc())
        .all(),
      orm.ContactAttempt
        .where({ reportId })
        .orderBy((c: any) => c.createdAt.desc())
        .all(),
      orm.Feedback.where({ reportId }).all(),
      orm.ReportResponderMatch
        .where({ reportId })
        .orderBy((m: any) => m.rank.asc())
        .all(),
    ]);

  // Fetch body info for contacts, feedback, and matches
  const bodyIds = [
    ...contacts.map((c: any) => c.bodyId),
    ...feedbacks.map((f: any) => f.bodyId),
    ...matches.map((m: any) => m.bodyId),
  ].filter(Boolean);
  const uniqueBodyIds = [...new Set(bodyIds)];

  const bodiesMap = new Map<string, any>();
  if (uniqueBodyIds.length > 0) {
    const bodies = await orm.ResponderBody
      .where((b: any) => b.id.in(uniqueBodyIds))
      .all();
    for (const b of bodies) bodiesMap.set(b.id, b);
  }

  return {
    id: report.id,
    reportNumber: report.reportNumber,
    status: report.status,
    animalType: report.animalType,
    animalName: report.animalName,
    aiCondition: report.aiCondition,
    citizenCondition: report.citizenCondition,
    severity: report.severity,
    description: report.description,
    location: {
      latitude: report.latitude,
      longitude: report.longitude,
      state: report.state,
      district: report.district,
      city: report.city,
      postalCode: report.postalCode,
      address: report.address,
    },
    citizen: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
        }
      : null,
    images: images.map((img: any) => ({
      id: img.id,
      url: img.url,
      mimeType: img.mimeType,
      sortOrder: img.sortOrder,
    })),
    aiAnalyses: aiAnalyses.map((ai: any) => ({
      id: ai.id,
      animalName: ai.animalName,
      animalConfidence: ai.animalConfidence,
      condition: ai.condition,
      conditionConfidence: ai.conditionConfidence,
      severity: ai.severity,
      severityConfidence: ai.severityConfidence,
      observations: ai.observations,
      model: ai.model,
      status: ai.status,
      createdAt: ai.createdAt,
    })),
    events,
    contacts: contacts.map((c: any) => ({
      id: c.id,
      bodyId: c.bodyId,
      bodyName: bodiesMap.get(c.bodyId)?.name,
      bodyType: bodiesMap.get(c.bodyId)?.type,
      type: c.type,
      status: c.status,
      initiatedAt: c.initiatedAt,
    })),
    feedback: feedbacks.map((f: any) => ({
      id: f.id,
      bodyName: bodiesMap.get(f.bodyId)?.name,
      overallRating: f.overallRating,
      responseTimeRating: f.responseTimeRating,
      professionalismRating: f.professionalismRating,
      outcome: f.outcome,
      comment: f.comment,
      createdAt: f.createdAt,
    })),
    matches: matches.map((m: any) => ({
      bodyId: m.bodyId,
      bodyName: bodiesMap.get(m.bodyId)?.name,
      bodyType: bodiesMap.get(m.bodyId)?.type,
      distanceKm: m.distanceKm,
      rank: m.rank,
      isRecommended: m.isRecommended,
    })),
    incidentOccurredAt: report.incidentOccurredAt,
    submittedAt: report.submittedAt,
    resolvedAt: report.resolvedAt,
    createdAt: report.createdAt,
  };
}

export async function deleteReport(reportId: string) {
  const report = await orm.Report.where({ id: reportId }).first();

  if (!report) {
    throw new AppError("REPORT_NOT_FOUND", "Report not found", 404);
  }

  // Fetch images for storage cleanup
  const images = await orm.ReportImage.where({ reportId }).all();
  const storageKeys = images
    .map((img: any) => img.storageKey)
    .filter(Boolean);

  // Delete related records in order
  await orm.Feedback.where({ reportId }).deleteMany();
  await orm.ContactAttempt.where({ reportId }).deleteMany();
  await orm.ReportEvent.where({ reportId }).deleteMany();
  await orm.ReportResponderMatch.where({ reportId }).deleteMany();
  await orm.AIAnalysis.where({ reportId }).deleteMany();
  await orm.ReportImage.where({ reportId }).deleteMany();
  await orm.Report.where({ id: reportId }).delete();

  if (storageKeys.length > 0) {
    await deleteFiles(storageKeys).catch(() => {});
  }

  return { deleted: true };
}
