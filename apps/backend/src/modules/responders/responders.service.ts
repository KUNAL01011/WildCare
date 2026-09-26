import { prisma } from "@/infrastructure/database/prisma";
import { AppError } from "@/core/errors/app-error";

const orm = (prisma as any).orm.public;

export async function getMatchedResponders(
  reportId: string,
  userId: string,
  limit: number = 5
) {
  const report = await orm.Report.where({ id: reportId, userId }).first();

  if (!report) {
    throw new AppError("REPORT_NOT_FOUND", "Report not found", 404);
  }

  // Check for existing matches
  let matches = await orm.ReportResponderMatch
    .where({ reportId })
    .orderBy((m: any) => m.rank.asc())
    .limit(limit)
    .all();

  // If no matches exist yet, compute them
  if (matches.length === 0) {
    matches = await computeAndSaveMatches(reportId, report, limit);
  }

  // Fetch body data for matches
  const bodyIds = matches.map((m: any) => m.bodyId).filter(Boolean);
  const bodiesMap = new Map<string, any>();
  const servicesMap = new Map<string, any[]>();
  const feedbackMap = new Map<string, any[]>();

  if (bodyIds.length > 0) {
    const [bodies, services, feedbacks] = await Promise.all([
      orm.ResponderBody.where((b: any) => b.id.in(bodyIds)).all(),
      orm.ResponderService.where((s: any) => s.bodyId.in(bodyIds)).all(),
      orm.Feedback.where((f: any) => f.bodyId.in(bodyIds)).all(),
    ]);

    for (const b of bodies) bodiesMap.set(b.id, b);
    for (const s of services) {
      if (!servicesMap.has(s.bodyId)) servicesMap.set(s.bodyId, []);
      servicesMap.get(s.bodyId)!.push(s);
    }
    for (const f of feedbacks) {
      if (!feedbackMap.has(f.bodyId)) feedbackMap.set(f.bodyId, []);
      feedbackMap.get(f.bodyId)!.push(f);
    }
  }

  return matches.map((m: any) => {
    const body = bodiesMap.get(m.bodyId);
    const bodyFeedback = feedbackMap.get(m.bodyId) ?? [];
    const avgRating =
      bodyFeedback.length > 0
        ? bodyFeedback.reduce((s: number, f: any) => s + f.overallRating, 0) /
          bodyFeedback.length
        : null;

    return {
      id: body?.id,
      name: body?.name,
      type: body?.type,
      verified: body?.verificationStatus === "VERIFIED",
      distanceKm: m.distanceKm ?? 0,
      services: (servicesMap.get(m.bodyId) ?? []).map((s: any) => s.serviceType),
      phone: body?.phone,
      averageResponseTimeMinutes: avgRating ? Math.round(avgRating * 10) : null,
    };
  });
}

async function computeAndSaveMatches(
  reportId: string,
  report: any,
  limit: number
) {
  // Find verified bodies near the report location
  let query = orm.ResponderBody.where({ verificationStatus: "VERIFIED" });
  if (report.state) query = query.where({ state: report.state });
  const bodies = await query.limit(limit).all();

  const matchData = bodies.map((body: any, index: number) => {
    let distance = 0;
    if (body.latitude && body.longitude) {
      distance = haversineDistance(
        report.latitude,
        report.longitude,
        body.latitude,
        body.longitude
      );
    }

    return {
      reportId,
      bodyId: body.id,
      distanceKm: Math.round(distance * 10) / 10,
      matchReason: "LOCATION_MATCH",
      rank: index + 1,
      isRecommended: index === 0,
    };
  });

  if (matchData.length > 0) {
    await Promise.all(
      matchData.map((m) => orm.ReportResponderMatch.create(m))
    );
  }

  // Return the newly created matches
  return orm.ReportResponderMatch
    .where({ reportId })
    .orderBy((m: any) => m.rank.asc())
    .limit(limit)
    .all();
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getResponderById(bodyId: string) {
  const body = await orm.ResponderBody.where({ id: bodyId }).first();

  if (!body) {
    throw new AppError("BODY_NOT_FOUND", "Responder body not found", 404);
  }

  const services = await orm.ResponderService.where({ bodyId }).all();

  return {
    id: body.id,
    name: body.name,
    type: body.type,
    description: body.description,
    verified: body.verificationStatus === "VERIFIED",
    phone: body.phone,
    email: body.email,
    location: {
      state: body.state,
      district: body.district,
      city: body.city,
    },
    services: services.map((s: any) => s.serviceType),
  };
}
