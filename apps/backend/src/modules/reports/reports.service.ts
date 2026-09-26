import { prisma } from "@/infrastructure/database/prisma";
import { AppError } from "@/core/errors/app-error";
import * as storageService from "@/infrastructure/storage/storage.service";
import { analyzeAnimalImages } from "@/infrastructure/ai/gemini.service";
import crypto from "node:crypto";

const orm = (prisma as any).orm.public;

function generateReportNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = crypto.randomInt(1000, 9999);
  return `WC-${y}${m}${d}-${rand}`;
}

export async function listReports(
  userId: string,
  opts: { status?: string; page: number; limit: number }
) {
  let allReports = await orm.Report
    .where({ userId })
    .orderBy((r: any) => r.createdAt.desc())
    .all();

  if (opts.status) {
    allReports = allReports.filter((r: any) => r.status === opts.status);
  }

  const total = allReports.length;
  const skip = (opts.page - 1) * opts.limit;
  const reports = allReports.slice(skip, skip + opts.limit);

  // Fetch first image for each report
  const reportIds = reports.map((r: any) => r.id);
  const imagesByReport = new Map<string, any[]>();

  if (reportIds.length > 0) {
    const images = await orm.ReportImage
      .where((i: any) => i.reportId.in(reportIds))
      .orderBy((i: any) => i.sortOrder.asc())
      .all();
    for (const img of images) {
      if (!imagesByReport.has(img.reportId)) {
        imagesByReport.set(img.reportId, [{ url: img.url }]);
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
      location: {
        city: r.city,
        state: r.state,
      },
      images: imagesByReport.get(r.id) ?? [],
      createdAt: r.createdAt,
    })),
    total,
    page: opts.page,
  };
}

export async function getReportById(reportId: string, userId: string) {
  const report = await orm.Report.where({ id: reportId, userId }).first();

  if (!report) {
    throw new AppError("REPORT_NOT_FOUND", "Report not found", 404);
  }

  // Fetch related data separately
  const [images, aiAnalyses, events, contacts, feedbacks] = await Promise.all([
    orm.ReportImage
      .where({ reportId })
      .orderBy((i: any) => i.sortOrder.asc())
      .all(),
    orm.AIAnalysis
      .where({ reportId })
      .orderBy((a: any) => a.createdAt.desc())
      .limit(1)
      .all(),
    orm.ReportEvent
      .where({ reportId })
      .orderBy((e: any) => e.createdAt.asc())
      .all(),
    orm.ContactAttempt
      .where({ reportId })
      .orderBy((c: any) => c.createdAt.desc())
      .all(),
    orm.Feedback.where({ reportId }).limit(1).all(),
  ]);

  // Fetch body names for contacts
  const bodyIds = contacts.map((c: any) => c.bodyId).filter(Boolean);
  const bodiesMap = new Map<string, any>();
  if (bodyIds.length > 0) {
    const bodies = await orm.ResponderBody
      .where((b: any) => b.id.in(bodyIds))
      .all();
    for (const b of bodies) bodiesMap.set(b.id, b);
  }

  const ai = aiAnalyses?.[0] ?? null;

  return {
    id: report.id,
    reportNumber: report.reportNumber,
    status: report.status,
    animal: ai
      ? { name: ai.animalName, confidence: ai.animalConfidence }
      : null,
    condition: {
      ai: ai?.condition ?? null,
      confidence: ai?.conditionConfidence ?? null,
      citizen: report.citizenCondition,
    },
    severity: report.severity,
    location: {
      latitude: report.latitude,
      longitude: report.longitude,
      city: report.city,
      state: report.state,
      postalCode: report.postalCode,
    },
    images: images.map((img: any) => ({
      url: img.url,
      sortOrder: img.sortOrder,
    })),
    description: report.description,
    createdAt: report.createdAt,
    submittedAt: report.submittedAt,
    resolvedAt: report.resolvedAt,
    events: events?.map((e: any) => ({
      id: e.id,
      type: e.type,
      description: e.description,
      actorType: e.actorType,
      createdAt: e.createdAt,
    })),
    contacts: contacts?.map((c: any) => ({
      id: c.id,
      bodyId: c.bodyId,
      bodyName: bodiesMap.get(c.bodyId)?.name,
      type: c.type,
      status: c.status,
      initiatedAt: c.initiatedAt,
    })),
    feedback: feedbacks?.[0]
      ? {
          id: feedbacks[0].id,
          overallRating: feedbacks[0].overallRating,
          responseTimeRating: feedbacks[0].responseTimeRating,
          professionalismRating: feedbacks[0].professionalismRating,
          outcome: feedbacks[0].outcome,
          comment: feedbacks[0].comment,
          createdAt: feedbacks[0].createdAt,
        }
      : null,
  };
}

export async function createReport(
  userId: string,
  files: Express.Multer.File[],
  latitude: number,
  longitude: number,
  incidentOccurredAt?: string
) {
  if (!files.length) {
    throw new AppError("IMAGE_REQUIRED", "At least one image is required", 400);
  }

  const reportNumber = generateReportNumber();

  const imageData = await Promise.all(
    files.map(async (file, index) => {
      const result = await storageService.saveFile(file.buffer, file.mimetype);
      return {
        storageKey: result.storageKey,
        url: result.url,
        mimeType: file.mimetype,
        fileSize: result.fileSize,
        sortOrder: index,
      };
    })
  );

  // Create report
  const report = await orm.Report.create({
    reportNumber,
    userId,
    status: "ANALYZING",
    latitude,
    longitude,
    incidentOccurredAt: incidentOccurredAt ?? new Date().toISOString(),
  });

  // Create images separately
  await Promise.all(
    imageData.map((img) =>
      orm.ReportImage.create({
        ...img,
        reportId: report.id,
      })
    )
  );

  // Create initial event
  await orm.ReportEvent.create({
    reportId: report.id,
    type: "REPORT_CREATED",
    description: "Report created with images uploaded",
    actorType: "CITIZEN",
    actorId: userId,
  });

  const imageInputs = files.map((file) => ({
    buffer: file.buffer,
    mimeType: file.mimetype,
  }));

  runAIAnalysis(report.id, imageInputs).catch(() => {});

  return {
    reportId: report.id,
    reportNumber: report.reportNumber,
    status: report.status,
  };
}

async function runAIAnalysis(
  reportId: string,
  images: { buffer: Buffer; mimeType: string }[]
) {
  try {
    const result = await analyzeAnimalImages(images);

    await orm.AIAnalysis.create({
      reportId,
      animalName: result.animalName,
      animalConfidence: result.animalConfidence,
      condition: result.condition,
      conditionConfidence: result.conditionConfidence,
      severity: result.severity,
      severityConfidence: result.severityConfidence,
      observations: { notes: result.observations },
      rawResponse: result,
      model: "gemini-2.0-flash",
      modelVersion: "2.0",
      status: "COMPLETED",
    });

    await orm.Report.where({ id: reportId }).update({
      status: "READY_FOR_REVIEW",
      animalName: result.animalName,
      animalType: result.animalType,
      aiCondition: result.condition,
      severity: result.severity,
    });

    await orm.ReportEvent.create({
      reportId,
      type: "AI_ANALYSIS_COMPLETED",
      description: `AI identified: ${result.animalName} (${result.condition}, ${result.severity} severity)`,
      actorType: "SYSTEM",
    });
  } catch {
    await orm.Report.where({ id: reportId }).update({
      status: "READY_FOR_REVIEW",
    });

    await orm.ReportEvent.create({
      reportId,
      type: "AI_ANALYSIS_FAILED",
      description: "AI analysis failed - manual review needed",
      actorType: "SYSTEM",
    });
  }
}

export async function updateReport(
  reportId: string,
  userId: string,
  data: {
    animalName?: string;
    citizenCondition?: string;
    severity?: string;
    description?: string;
  }
) {
  const report = await orm.Report.where({ id: reportId, userId }).first();

  if (!report) {
    throw new AppError("REPORT_NOT_FOUND", "Report not found", 404);
  }

  if (report.status !== "READY_FOR_REVIEW") {
    throw new AppError(
      "INVALID_REPORT_STATUS",
      "Report can only be edited in READY_FOR_REVIEW status",
      400
    );
  }

  const updated = await orm.Report.where({ id: reportId }).update(data);

  return { id: updated.id, status: updated.status };
}

export async function submitReport(reportId: string, userId: string) {
  const report = await orm.Report.where({ id: reportId, userId }).first();

  if (!report) {
    throw new AppError("REPORT_NOT_FOUND", "Report not found", 404);
  }

  if (report.status !== "READY_FOR_REVIEW") {
    throw new AppError(
      "INVALID_REPORT_STATUS",
      "Report can only be submitted from READY_FOR_REVIEW status",
      400
    );
  }

  const updated = await orm.Report.where({ id: reportId }).update({
    status: "SUBMITTED",
    submittedAt: new Date().toISOString(),
  });

  await orm.ReportEvent.create({
    reportId,
    type: "REPORT_SUBMITTED",
    description: "Report submitted by citizen",
    actorType: "CITIZEN",
    actorId: userId,
  });

  return { id: updated.id, status: updated.status };
}

export async function recordContactAttempt(
  reportId: string,
  userId: string,
  bodyId: string,
  type: string
) {
  const report = await orm.Report.where({ id: reportId, userId }).first();

  if (!report) {
    throw new AppError("REPORT_NOT_FOUND", "Report not found", 404);
  }

  const body = await orm.ResponderBody.where({ id: bodyId }).first();

  if (!body) {
    throw new AppError("BODY_NOT_FOUND", "Responder body not found", 404);
  }

  const contact = await orm.ContactAttempt.create({
    reportId,
    bodyId,
    userId,
    type,
    status: "INITIATED",
  });

  if (report.status === "SUBMITTED") {
    await orm.Report.where({ id: reportId }).update({
      status: "RESPONDER_CONTACTED",
    });
  }

  await orm.ReportEvent.create({
    reportId,
    type: "CONTACT_INITIATED",
    description: `Contact attempted with ${body.name}`,
    actorType: "CITIZEN",
    actorId: userId,
  });

  return {
    contactAttemptId: contact.id,
    status: contact.status,
  };
}

export async function updateResponseStatus(
  reportId: string,
  userId: string,
  status: string
) {
  const report = await orm.Report.where({ id: reportId, userId }).first();

  if (!report) {
    throw new AppError("REPORT_NOT_FOUND", "Report not found", 404);
  }

  const updateData: any = { status };
  if (status === "RESOLVED") {
    updateData.resolvedAt = new Date().toISOString();
  }

  await orm.Report.where({ id: reportId }).update(updateData);

  const eventTypeMap: Record<string, string> = {
    RESPONDER_CONTACTED: "RESPONDER_CONTACTED",
    RESPONDER_ACCEPTED: "RESPONDER_ACCEPTED",
    IN_PROGRESS: "RESPONSE_STARTED",
    RESOLVED: "REPORT_RESOLVED",
    UNABLE_TO_REACH_RESPONDER: "UNABLE_TO_REACH_RESPONDER",
  };

  await orm.ReportEvent.create({
    reportId,
    type: eventTypeMap[status] ?? status,
    description: `Status changed to ${status}`,
    actorType: "CITIZEN",
    actorId: userId,
  });

  return { id: reportId, status };
}
