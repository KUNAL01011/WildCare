import { prisma } from "@/infrastructure/database/prisma";
import { AppError } from "@/core/errors/app-error";

const orm = (prisma as any).orm.public;

export async function listBodies(opts: {
  search?: string;
  type?: string;
  verificationStatus?: string;
  state?: string;
  district?: string;
  city?: string;
  page: number;
  limit: number;
}) {
  let allBodies = await orm.ResponderBody
    .orderBy((b: any) => b.createdAt.desc())
    .all();

  if (opts.search) {
    const searchLower = opts.search.toLowerCase();
    allBodies = allBodies.filter(
      (b: any) =>
        b.name?.toLowerCase().includes(searchLower) ||
        b.email?.toLowerCase().includes(searchLower)
    );
  }
  if (opts.type) allBodies = allBodies.filter((b: any) => b.type === opts.type);
  if (opts.verificationStatus) {
    allBodies = allBodies.filter(
      (b: any) => b.verificationStatus === opts.verificationStatus
    );
  }
  if (opts.state) allBodies = allBodies.filter((b: any) => b.state === opts.state);
  if (opts.district) allBodies = allBodies.filter((b: any) => b.district === opts.district);
  if (opts.city) allBodies = allBodies.filter((b: any) => b.city === opts.city);

  const total = allBodies.length;
  const skip = (opts.page - 1) * opts.limit;
  const bodies = allBodies.slice(skip, skip + opts.limit);

  // Fetch services and counts for paginated bodies
  const bodyIds = bodies.map((b: any) => b.id);
  const servicesMap = new Map<string, any[]>();
  const feedbackCountMap = new Map<string, number>();
  const contactCountMap = new Map<string, number>();

  if (bodyIds.length > 0) {
    const [services, feedbacks, contacts] = await Promise.all([
      orm.ResponderService.where((s: any) => s.bodyId.in(bodyIds)).all(),
      orm.Feedback.where((f: any) => f.bodyId.in(bodyIds)).all(),
      orm.ContactAttempt.where((c: any) => c.bodyId.in(bodyIds)).all(),
    ]);

    for (const s of services) {
      if (!servicesMap.has(s.bodyId)) servicesMap.set(s.bodyId, []);
      servicesMap.get(s.bodyId)!.push(s);
    }
    for (const f of feedbacks) {
      feedbackCountMap.set(f.bodyId, (feedbackCountMap.get(f.bodyId) ?? 0) + 1);
    }
    for (const c of contacts) {
      contactCountMap.set(c.bodyId, (contactCountMap.get(c.bodyId) ?? 0) + 1);
    }
  }

  return {
    bodies: bodies.map((b: any) => ({
      id: b.id,
      name: b.name,
      type: b.type,
      phone: b.phone,
      email: b.email,
      state: b.state,
      district: b.district,
      city: b.city,
      verificationStatus: b.verificationStatus,
      availabilityStatus: b.availabilityStatus,
      services: (servicesMap.get(b.id) ?? []).map((s: any) => s.serviceType),
      feedbackCount: feedbackCountMap.get(b.id) ?? 0,
      contactCount: contactCountMap.get(b.id) ?? 0,
      createdAt: b.createdAt,
    })),
    total,
    page: opts.page,
  };
}

export async function createBody(data: {
  name: string;
  type: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  state?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  services?: string[];
  animalTypes?: string[];
}) {
  const { services, animalTypes, ...bodyData } = data;

  const body = await orm.ResponderBody.create(bodyData);

  if (services?.length) {
    await Promise.all(
      services.map((s: string) =>
        orm.ResponderService.create({ bodyId: body.id, serviceType: s })
      )
    );
  }

  if (animalTypes?.length) {
    await Promise.all(
      animalTypes.map((a: string) =>
        orm.ResponderAnimalSupport.create({ bodyId: body.id, animalType: a })
      )
    );
  }

  return {
    id: body.id,
    name: body.name,
    type: body.type,
    verificationStatus: body.verificationStatus,
  };
}

export async function getBodyById(bodyId: string) {
  const body = await orm.ResponderBody.where({ id: bodyId }).first();

  if (!body) {
    throw new AppError("BODY_NOT_FOUND", "Responder body not found", 404);
  }

  const [services, animalSupport, feedbacks, contacts, matches] =
    await Promise.all([
      orm.ResponderService.where({ bodyId }).all(),
      orm.ResponderAnimalSupport.where({ bodyId }).all(),
      orm.Feedback.where({ bodyId }).all(),
      orm.ContactAttempt.where({ bodyId }).all(),
      orm.ReportResponderMatch.where({ bodyId }).all(),
    ]);

  const avgRating =
    feedbacks.length > 0
      ? feedbacks.reduce((s: number, f: any) => s + f.overallRating, 0) /
        feedbacks.length
      : null;

  return {
    id: body.id,
    name: body.name,
    type: body.type,
    description: body.description,
    phone: body.phone,
    email: body.email,
    website: body.website,
    address: body.address,
    state: body.state,
    district: body.district,
    city: body.city,
    postalCode: body.postalCode,
    latitude: body.latitude,
    longitude: body.longitude,
    verificationStatus: body.verificationStatus,
    availabilityStatus: body.availabilityStatus,
    verifiedAt: body.verifiedAt,
    services: services.map((s: any) => s.serviceType),
    animalTypes: animalSupport.map((a: any) => a.animalType),
    stats: {
      feedbackCount: feedbacks.length,
      contactCount: contacts.length,
      matchCount: matches.length,
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    },
    createdAt: body.createdAt,
  };
}

export async function updateBody(bodyId: string, data: any) {
  const existing = await orm.ResponderBody.where({ id: bodyId }).first();
  if (!existing) {
    throw new AppError("BODY_NOT_FOUND", "Responder body not found", 404);
  }

  const { services, animalTypes, ...bodyData } = data;

  if (services) {
    await orm.ResponderService.where({ bodyId }).deleteMany();
    if (services.length > 0) {
      await Promise.all(
        services.map((s: string) =>
          orm.ResponderService.create({ bodyId, serviceType: s })
        )
      );
    }
  }

  if (animalTypes) {
    await orm.ResponderAnimalSupport.where({ bodyId }).deleteMany();
    if (animalTypes.length > 0) {
      await Promise.all(
        animalTypes.map((a: string) =>
          orm.ResponderAnimalSupport.create({ bodyId, animalType: a })
        )
      );
    }
  }

  const updated = await orm.ResponderBody.where({ id: bodyId }).update(bodyData);

  return { id: updated.id, name: updated.name };
}

export async function updateVerification(
  bodyId: string,
  verificationStatus: string
) {
  const existing = await orm.ResponderBody.where({ id: bodyId }).first();
  if (!existing) {
    throw new AppError("BODY_NOT_FOUND", "Responder body not found", 404);
  }

  const updateData: any = { verificationStatus };
  if (verificationStatus === "VERIFIED") {
    updateData.verifiedAt = new Date().toISOString();
  }

  const updated = await orm.ResponderBody
    .where({ id: bodyId })
    .update(updateData);

  return {
    id: updated.id,
    name: updated.name,
    verificationStatus: updated.verificationStatus,
  };
}
