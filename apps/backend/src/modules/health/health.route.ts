import { Router, type Request, type Response } from "express";

import { redis } from "@/infrastructure/redis/redis.client";
import { prisma } from "@/infrastructure/database/prisma";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get("/ready", async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};

  // Database check
  try {
    const plan = prisma.raw.sql`SELECT 1 AS "ok"`
      .returnsRow({
        ok: "pg/int4@1",
      })
      .build();

    await prisma.runtime().query(plan);

    checks.database = "ok";
  } catch {
    checks.database = "down";
  }

  // Redis check
  if (redis) {
    try {
      await redis.ping();
      checks.redis = "ok";
    } catch {
      checks.redis = "down";
    }
  } else {
    checks.redis = "disabled";
  }

  const healthy = checks.database === "ok";

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    checks,
  });
});

export default router;
