import { Router } from "express";
import { authenticateMiddleware } from "../../core/middleware/auth.middleware.js";
import {
  configureDispatchChannelController,
  configureServiceAreaController,
  provisionResponderController,
  verifyOrganizationController,
} from "./admin.controller.js";

const router = Router();

// All admin routes require authentication (Role check happens in the service layer)
router.use(authenticateMiddleware);

/**
 * @openapi
 * /api/v1/admin/organizations/{id}/verify:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Verify an organization
 *     description: Approves or rejects a pending organization application. Requires ADMIN role.
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
 *             required: [decision, reviewNotes]
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               reviewNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organization status updated
 *       403:
 *         description: Forbidden - Requires ADMIN role
 */
router.post("/organizations/:id/verify", verifyOrganizationController);

/**
 * @openapi
 * /api/v1/admin/responders:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Provision a Responder
 *     description: Manually creates a responder profile for a verified organization (e.g., government units). Requires ADMIN role.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organizationId, displayName, dashboardEnabled]
 *             properties:
 *               organizationId:
 *                 type: string
 *               displayName:
 *                 type: string
 *               dashboardEnabled:
 *                 type: boolean
 *               active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Responder provisioned
 */
router.post("/responders", provisionResponderController);

/**
 * @openapi
 * /api/v1/admin/responders/{id}/service-areas:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Configure Service Area
 *     description: Defines the geographic matching area for a responder. Requires ADMIN role.
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
 *             required: [name, type]
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [DISTRICT, CITY, STATE, ZONE, POLYGON]
 *               district:
 *                 type: string
 *               state:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service area created
 */
router.post("/responders/:id/service-areas", configureServiceAreaController);

/**
 * @openapi
 * /api/v1/admin/responders/{id}/dispatch-configurations:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Configure Dispatch Channel
 *     description: Adds a delivery method (Email, SMS, WhatsApp, Voice) to a responder. Requires ADMIN role.
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
 *             required: [channel, destination]
 *             properties:
 *               channel:
 *                 type: string
 *                 enum: [DASHBOARD, EMAIL, SMS, WHATSAPP, VOICE_CALL, WEBHOOK]
 *               destination:
 *                 type: string
 *                 description: Target email, phone number, or webhook URL
 *               enabled:
 *                 type: boolean
 *               priority:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Dispatch configuration created
 */
router.post(
  "/responders/:id/dispatch-configurations",
  configureDispatchChannelController
);

export default router;
