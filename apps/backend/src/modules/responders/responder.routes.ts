import { Router } from "express";
import { authenticateMiddleware } from "../../core/middleware/auth.middleware.js";
import {
  getMeResponderController,
  getResponderIncidentsController,
} from "./responder.controller.js";

const router = Router();

router.use(authenticateMiddleware);

/**
 * @openapi
 * /api/v1/responders/me:
 *   get:
 *     tags:
 *       - Responders
 *     summary: Get responder profile
 *     description: Returns the responder profile associated with the currently authenticated user. Requires RESPONDER role.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Responder profile details
 *       403:
 *         description: Forbidden - User is not a responder
 */
router.get("/me", getMeResponderController);

/**
 * @openapi
 * /api/v1/responders/me/incidents:
 *   get:
 *     tags:
 *       - Responders
 *     summary: Get responder incident queue
 *     description: Fetches a paginated list of incidents assigned to the authenticated responder's organization.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by incident status (e.g., DISPATCHED, ACKNOWLEDGED)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of assigned incidents
 */
router.get("/me/incidents", getResponderIncidentsController);

export default router;
