import { Router } from "express";
import { authenticateMiddleware } from "../../core/middleware/auth.middleware.js";
import {
  getNotificationsController,
  markReadController,
} from "./notification.controller.js";

const router = Router();

router.use(authenticateMiddleware);

/**
 * @openapi
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notifications
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get("/", getNotificationsController);

/**
 * @openapi
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification marked read
 */
router.patch("/:id/read", markReadController);

export default router;
