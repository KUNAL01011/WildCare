import { Router } from "express";
import { applyOrganizationController } from "./organization.controller.js";

const router = Router();

/**
 * @openapi
 * /api/v1/organizations/apply:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Apply as an Organization
 *     description: Public endpoint for external rescue organizations, NGOs, or veterinary clinics to apply to join WildCare.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, contactName, contactEmail, contactPhone]
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [GOVERNMENT, NGO, PRIVATE_RESCUE, VETERINARY, OTHER]
 *               description:
 *                 type: string
 *               contactName:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully (PENDING state)
 */
router.post("/apply", applyOrganizationController);

export default router;
