import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export function healthController(_req: Request, res: Response) {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
}

export async function readinessController(
  _req: Request,
  res: Response,
) {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      data: {
        status: "ready",
        database: "ok",
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Service is not ready",
      },
    });
  }
}