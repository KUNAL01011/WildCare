import { prisma } from "@/infrastructure/database/prisma";

const orm = (prisma as any).orm.public;

export async function getDashboardStats() {
  const [allUsers, allReports, allBodies, allFeedback] = await Promise.all([
    orm.User.all(),
    orm.Report.all(),
    orm.ResponderBody.all(),
    orm.Feedback.all(),
  ]);

  // Build user map for quick lookup
  const usersMap = new Map<string, any>();
  for (const u of allUsers) usersMap.set(u.id, u);

  const totalCitizens = allUsers.length;
  const totalReports = allReports.length;
  const activeStatuses = [
    "ANALYZING",
    "READY_FOR_REVIEW",
    "SUBMITTED",
    "RESPONDER_CONTACTED",
    "RESPONDER_ACCEPTED",
    "IN_PROGRESS",
  ];
  const activeReports = allReports.filter((r: any) =>
    activeStatuses.includes(r.status)
  ).length;
  const resolvedReports = allReports.filter(
    (r: any) => r.status === "RESOLVED"
  ).length;
  const totalBodies = allBodies.length;
  const governmentBodies = allBodies.filter(
    (b: any) => b.type === "GOVERNMENT"
  ).length;
  const ngoBodies = allBodies.filter((b: any) => b.type === "NGO").length;
  const privateBodies = allBodies.filter(
    (b: any) => b.type === "PRIVATE"
  ).length;
  const totalFeedback = allFeedback.length;

  // Get 5 most recent reports
  const recentReports = allReports
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // Fetch first image for recent reports
  const recentReportIds = recentReports.map((r: any) => r.id);
  const imagesByReport = new Map<string, string>();
  if (recentReportIds.length > 0) {
    const images = await orm.ReportImage
      .where((i: any) => i.reportId.in(recentReportIds))
      .orderBy((i: any) => i.sortOrder.asc())
      .all();
    for (const img of images) {
      if (!imagesByReport.has(img.reportId)) {
        imagesByReport.set(img.reportId, img.url);
      }
    }
  }

  return {
    citizens: { total: totalCitizens },
    reports: {
      total: totalReports,
      active: activeReports,
      resolved: resolvedReports,
    },
    bodies: {
      total: totalBodies,
      government: governmentBodies,
      ngo: ngoBodies,
      private: privateBodies,
    },
    feedback: { total: totalFeedback },
    recentReports: recentReports.map((r: any) => ({
      id: r.id,
      reportNumber: r.reportNumber,
      status: r.status,
      animalName: r.animalName,
      city: r.city,
      state: r.state,
      citizenName: usersMap.get(r.userId)?.name,
      imageUrl: imagesByReport.get(r.id),
      createdAt: r.createdAt,
    })),
  };
}
