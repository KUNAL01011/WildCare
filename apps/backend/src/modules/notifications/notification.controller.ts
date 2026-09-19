import type { Request, Response } from "express";
import { asyncHandler } from "../../core/middleware/async-handler.middleware.js";
import { getNotificationsSchema } from "./notification.validation.js";
import {
  getNotifications,
  markNotificationRead,
} from "./notification.service.js";

export const getNotificationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = getNotificationsSchema.parse(req.query);
    const result = await getNotifications(req.user!.id, input);
    res.status(200).json({ success: true, data: result });
  }
);

export const markReadController = asyncHandler(
  async (req: Request, res: Response) => {
    await markNotificationRead(req.params.id as string, req.user!.id);
    res.status(200).json({ success: true });
  }
);
