import { prisma } from "@/infrastructure/database/prisma";

const orm = (prisma as any).orm.public;

export async function getStates() {
  const locations = await orm.Location
    .orderBy((l: any) => l.state.asc())
    .all();

  return [...new Set(locations.map((l: any) => l.state))].filter(Boolean);
}

export async function getDistricts(state: string) {
  const locations = await orm.Location
    .where({ state })
    .orderBy((l: any) => l.district.asc())
    .all();

  return [...new Set(locations.map((l: any) => l.district))].filter(Boolean);
}

export async function getCities(district: string) {
  const locations = await orm.Location
    .where({ district })
    .orderBy((l: any) => l.city.asc())
    .all();

  return [...new Set(locations.map((l: any) => l.city))].filter(Boolean);
}

export async function getLocationSummary(opts: {
  state?: string;
  district?: string;
  city?: string;
  from?: string;
  to?: string;
}) {
  const [allReports, allBodies] = await Promise.all([
    orm.Report.all(),
    orm.ResponderBody.all(),
  ]);

  let filteredReports = allReports;
  let filteredBodies = allBodies;

  if (opts.state) {
    filteredReports = filteredReports.filter((r: any) => r.state === opts.state);
    filteredBodies = filteredBodies.filter((b: any) => b.state === opts.state);
  }
  if (opts.district) {
    filteredReports = filteredReports.filter((r: any) => r.district === opts.district);
    filteredBodies = filteredBodies.filter((b: any) => b.district === opts.district);
  }
  if (opts.city) {
    filteredReports = filteredReports.filter((r: any) => r.city === opts.city);
    filteredBodies = filteredBodies.filter((b: any) => b.city === opts.city);
  }
  if (opts.from) {
    filteredReports = filteredReports.filter(
      (r: any) => new Date(r.createdAt) >= new Date(opts.from!)
    );
  }
  if (opts.to) {
    filteredReports = filteredReports.filter(
      (r: any) => new Date(r.createdAt) <= new Date(opts.to!)
    );
  }

  return {
    reports: filteredReports.length,
    bodies: filteredBodies.length,
    resolved: filteredReports.filter((r: any) => r.status === "RESOLVED").length,
  };
}
