import { prisma } from "@/infrastructure/database/prisma";
import { AppError } from "@/core/errors/app-error";

const orm = (prisma as any).orm.public;

export async function listCitizens(opts: {
  search?: string;
  state?: string;
  district?: string;
  city?: string;
  page: number;
  limit: number;
}) {
  let allCitizens = await orm.User
    .orderBy((u: any) => u.createdAt.desc())
    .all();

  if (opts.search) {
    const searchLower = opts.search.toLowerCase();
    allCitizens = allCitizens.filter(
      (c: any) =>
        c.name?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower)
    );
  }

  const total = allCitizens.length;
  const skip = (opts.page - 1) * opts.limit;
  const citizens = allCitizens.slice(skip, skip + opts.limit);

  // Fetch report counts for paginated citizens
  const citizenIds = citizens.map((c: any) => c.id);
  const reportCountMap = new Map<string, number>();

  if (citizenIds.length > 0) {
    const reports = await orm.Report
      .where((r: any) => r.userId.in(citizenIds))
      .all();
    for (const r of reports) {
      reportCountMap.set(r.userId, (reportCountMap.get(r.userId) ?? 0) + 1);
    }
  }

  return {
    citizens: citizens.map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      profileImage: c.profileImage,
      reportCount: reportCountMap.get(c.id) ?? 0,
      createdAt: c.createdAt,
    })),
    total,
    page: opts.page,
  };
}

export async function getCitizenById(userId: string) {
  const citizen = await orm.User.where({ id: userId }).first();

  if (!citizen) {
    throw new AppError("RESOURCE_NOT_FOUND", "Citizen not found", 404);
  }

  // Fetch recent reports
  const reports = await orm.Report
    .where({ userId })
    .orderBy((r: any) => r.createdAt.desc())
    .limit(20)
    .all();

  // Fetch first image for each report
  const reportIds = reports.map((r: any) => r.id);
  const imagesByReport = new Map<string, string>();

  if (reportIds.length > 0) {
    const images = await orm.ReportImage
      .where((i: any) => i.reportId.in(reportIds))
      .orderBy((i: any) => i.sortOrder.asc())
      .all();
    for (const img of images) {
      if (!imagesByReport.has(img.reportId)) {
        imagesByReport.set(img.reportId, img.url);
      }
    }
  }

  return {
    id: citizen.id,
    name: citizen.name,
    email: citizen.email,
    profileImage: citizen.profileImage,
    createdAt: citizen.createdAt,
    reports: reports.map((r: any) => ({
      id: r.id,
      reportNumber: r.reportNumber,
      status: r.status,
      animalName: r.animalName,
      city: r.city,
      state: r.state,
      imageUrl: imagesByReport.get(r.id),
      createdAt: r.createdAt,
    })),
  };
}
