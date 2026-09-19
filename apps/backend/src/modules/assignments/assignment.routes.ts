import { Router } from "express";
import { authenticateMiddleware } from "../../core/middleware/auth.middleware.js";
import {
  createAssignmentController,
  getEligibleRespondersController,
} from "./assignment.controller.js";

const router = Router({ mergeParams: true });

router.use(authenticateMiddleware);

/**
 * @openapi
 * /api/v1/incidents/{id}/responders:
 *   get:
 *     tags:
 *       - Responder Discovery
 *     summary: Find eligible responders
 *     description: Matches the incident location against active service areas to find verified responders. Must be called by the citizen who reported the incident.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of eligible responders
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
 *                           responderId:
 *                             type: string
 *                           organizationName:
 *                             type: string
 *                           displayName:
 *                             type: string
 *                           serviceArea:
 *                             type: string
 *                           availableChannels:
 *                             type: array
 *                             items:
 *                               type: string
 */
router.get("/responders", getEligibleRespondersController);

/**
 * @openapi
 * /api/v1/incidents/{id}/assignment:
 *   post:
 *     tags:
 *       - Assignments
 *     summary: Select a responder
 *     description: Assigns the selected responder to the incident and transitions the incident status to DISPATCHING. Triggers the asynchronous dispatch workflow.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [responderId]
 *             properties:
 *               responderId:
 *                 type: string
 *                 example: "resp_001"
 *     responses:
 *       202:
 *         description: Assignment accepted and dispatching initiated
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
 *                     incidentId:
 *                       type: string
 *                     responderId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "DISPATCHING"
 *       403:
 *         description: Forbidden - Not the incident reporter
 *       422:
 *         description: Incident is not in a valid state or responder is not eligible
 */
router.post("/assignment", createAssignmentController);

export default router;
