import { prisma } from "@/infrastructure/database/prisma";

const orm = (prisma as any).orm.public;

export async function getReportAnalytics(opts: {
  state?: string;
  district?: string;
  city?: string;
  from?: string;
  to?: string;
}) {
  let allReports = await orm.Report.all();

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

  // Group by status
  const statusMap = new Map<string, number>();
  for (const r of allReports) {
    if (r.status) statusMap.set(r.status, (statusMap.get(r.status) ?? 0) + 1);
  }
  const byStatus = Array.from(statusMap).map(([status, count]) => ({ status, count }));

  // Group by animalName (top 10)
  const animalMap = new Map<string, number>();
  for (const r of allReports) {
    if (r.animalName) animalMap.set(r.animalName, (animalMap.get(r.animalName) ?? 0) + 1);
  }
  const byAnimal = Array.from(animalMap)
    .map(([animal, count]) => ({ animal, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Group by severity
  const severityMap = new Map<string, number>();
  for (const r of allReports) {
    if (r.severity) severityMap.set(r.severity, (severityMap.get(r.severity) ?? 0) + 1);
  }
  const bySeverity = Array.from(severityMap).map(([severity, count]) => ({ severity, count }));

  return { total, byStatus, byAnimal, bySeverity };
}

export async function getBodyAnalytics() {
  const allBodies = await orm.ResponderBody.all();

  const typeMap = new Map<string, number>();
  for (const b of allBodies) {
    if (b.type) typeMap.set(b.type, (typeMap.get(b.type) ?? 0) + 1);
  }
  const byType = Array.from(typeMap).map(([type, count]) => ({ type, count }));

  const verMap = new Map<string, number>();
  for (const b of allBodies) {
    if (b.verificationStatus) {
      verMap.set(b.verificationStatus, (verMap.get(b.verificationStatus) ?? 0) + 1);
    }
  }
  const byVerification = Array.from(verMap).map(([status, count]) => ({ status, count }));

  return { byType, byVerification };
}

export async function getFeedbackAnalytics() {
  const allFeedback = await orm.Feedback.all();

  const total = allFeedback.length;

  const outcomeMap = new Map<string, number>();
  for (const f of allFeedback) {
    if (f.outcome) outcomeMap.set(f.outcome, (outcomeMap.get(f.outcome) ?? 0) + 1);
  }
  const byOutcome = Array.from(outcomeMap).map(([outcome, count]) => ({ outcome, count }));

  const ratingMap = new Map<number, number>();
  for (const f of allFeedback) {
    if (f.overallRating != null) {
      ratingMap.set(f.overallRating, (ratingMap.get(f.overallRating) ?? 0) + 1);
    }
  }
  const byRating = Array.from(ratingMap)
    .map(([rating, count]) => ({ rating, count }))
    .sort((a, b) => a.rating - b.rating);

  return { total, byOutcome, byRating };
}

export async function getResponseTimeAnalytics() {
  const allResolved = await orm.Report
    .where({ status: "RESOLVED" })
    .orderBy((r: any) => r.resolvedAt.desc())
    .limit(100)
    .all();

  const resolvedReports = allResolved.filter(
    (r: any) => r.submittedAt != null && r.resolvedAt != null
  );

  if (resolvedReports.length === 0) {
    return { averageMinutes: null, count: 0 };
  }

  const times = resolvedReports.map((r: any) => {
    const submitted = new Date(r.submittedAt).getTime();
    const resolved = new Date(r.resolvedAt).getTime();
    return (resolved - submitted) / (1000 * 60);
  });

  const avg = times.reduce((s: number, t: number) => s + t, 0) / times.length;

  return {
    averageMinutes: Math.round(avg),
    count: resolvedReports.length,
  };
}
