import { Router } from "express";
import { authenticateMiddleware } from "../../core/middleware/auth.middleware.js";
import { analyzeIncidentController } from "./ai-analysis.controller.js";

const router = Router({ mergeParams: true });

router.use(authenticateMiddleware);

/**
 * @openapi
 * /api/v1/incidents/{id}/analyze:
 *   post:
 *     tags:
 *       - AI Analysis
 *     summary: Analyze Incident
 *     description: Triggers Amazon Bedrock to analyze the incident description and uploaded evidence. Updates incident status to AWAITING_RESPONDER_SELECTION. AI output is advisory.
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
 *         description: Analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     incidentId:
 *                       type: string
 *                     analysisId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "AWAITING_RESPONDER_SELECTION"
 *                     analysis:
 *                       type: object
 *       403:
 *         description: Forbidden - Not the incident reporter
 *       404:
 *         description: Incident not found
 *       500:
 *         description: AI Analysis failed
 */
router.post("/", analyzeIncidentController);

export default router;
