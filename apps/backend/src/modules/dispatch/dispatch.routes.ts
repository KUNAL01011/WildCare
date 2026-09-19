import { Router } from "express";
import { authenticateMiddleware } from "../../core/middleware/auth.middleware.js";
import {
  getDispatchHistoryController,
  retryDispatchController,
} from "./dispatch.controller.js";

const router = Router({ mergeParams: true });

router.use(authenticateMiddleware);

/**
 * @openapi
 * /api/v1/incidents/{id}/dispatches:
 *   get:
 *     tags:
 *       - Dispatch
 *     summary: Get Dispatch History
 *     description: Returns a history of all attempts made to dispatch this incident to responders. Available to assigned responders and admins.
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
 *         description: List of dispatch attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           dispatchAttemptId:
 *                             type: string
 *                           channel:
 *                             type: string
 *                           status:
 *                             type: string
 *                           attemptNumber:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 */
router.get("/dispatches", getDispatchHistoryController);

/**
 * @openapi
 * /api/v1/incidents/{id}/dispatch/retry:
 *   post:
 *     tags:
 *       - Dispatch
 *     summary: Retry Dispatch
 *     description: Manually trigger a retry of a dispatch attempt on a specific channel. Intended for ADMIN use.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [channel]
 *             properties:
 *               channel:
 *                 type: string
 *                 example: "SMS"
 *     responses:
 *       202:
 *         description: Dispatch retry queued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "QUEUED"
 */
router.post("/dispatch/retry", retryDispatchController);

export default router;
