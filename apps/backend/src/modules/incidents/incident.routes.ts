import { Router } from "express";
import { authenticateMiddleware } from "../../core/middleware/auth.middleware.js";
import {
  acceptIncidentController,
  acknowledgeIncidentController,
  createIncidentController,
  getIncidentController,
  listMyIncidentsController,
  resolveIncidentController,
} from "./incident.controller.js";

const router = Router();

router.use(authenticateMiddleware);

/**
 * @openapi
 * /api/v1/incidents:
 *   post:
 *     tags:
 *       - Incidents
 *     summary: Create an incident draft
 *     description: Creates a new incident report in the DRAFT state. Must be called by a CITIZEN.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [incidentType, description, latitude, longitude]
 *             properties:
 *               incidentType:
 *                 type: string
 *                 example: "INJURED"
 *               description:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               locationAccuracy:
 *                 type: number
 *     responses:
 *       201:
 *         description: Incident created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", createIncidentController);

/**
 * @openapi
 * /api/v1/incidents:
 *   get:
 *     tags:
 *       - Incidents
 *     summary: List citizen incidents
 *     description: Returns a list of incidents reported by the authenticated citizen.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of incidents
 */
router.get("/", listMyIncidentsController);

/**
 * @openapi
 * /api/v1/incidents/{id}:
 *   get:
 *     tags:
 *       - Incidents
 *     summary: Get incident by ID
 *     description: Fetches incident details. Citizens can only view their own incidents. Responders can only view assigned incidents. Exact coordinates are protected.
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
 *         description: Incident details
 *       403:
 *         description: Forbidden access
 *       404:
 *         description: Incident not found
 */
router.get("/:id", getIncidentController);

/**
 * @openapi
 * /api/v1/incidents/{id}/acknowledge:
 *   post:
 *     tags:
 *       - Incidents (Responder)
 *     summary: Acknowledge an incident
 *     description: Updates the incident status to ACKNOWLEDGED. Only the assigned responder can perform this action.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Status updated
 */
router.post("/:id/acknowledge", acknowledgeIncidentController);

/**
 * @openapi
 * /api/v1/incidents/{id}/accept:
 *   post:
 *     tags:
 *       - Incidents (Responder)
 *     summary: Accept an incident
 *     description: Updates the incident status to ACCEPTED. Only the assigned responder can perform this action.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Status updated
 */
router.post("/:id/accept", acceptIncidentController);

/**
 * @openapi
 * /api/v1/incidents/{id}/resolve:
 *   post:
 *     tags:
 *       - Incidents (Responder)
 *     summary: Resolve an incident
 *     description: Marks an assigned incident as RESOLVED.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resolutionNote]
 *             properties:
 *               resolutionNote:
 *                 type: string
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Status updated to RESOLVED
 */
router.post("/:id/resolve", resolveIncidentController);

export default router;
