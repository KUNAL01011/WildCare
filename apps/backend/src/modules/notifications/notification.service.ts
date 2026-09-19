import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../core/errors/app-error.js";
import type { GetNotificationsInput } from "./notification.validation.js";

export async function getNotifications(
  userId: string,
  input: GetNotificationsInput
) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
  });

  let nextCursor: string | null = null;
  if (notifications.length > input.limit) {
    const nextItem = notifications.pop();
    nextCursor = nextItem!.id;
  }

  // Format response for the frontend (mapping readAt to a boolean `read`)
  const items = notifications.map(n => ({
    notificationId: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.readAt !== null,
    createdAt: n.createdAt,
  }));

  return { items, nextCursor };
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new AppError("NOT_FOUND", "Notification not found", 404);
  }

  if (notification.userId !== userId) {
    throw new AppError("FORBIDDEN", "Not authorized", 403);
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}
