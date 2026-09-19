import { Router } from "express";
import { authenticateMiddleware } from "../../core/middleware/auth.middleware.js";
import {
  completeUploadController,
  getUploadUrlController,
} from "./evidence.controller.js";

const router = Router({ mergeParams: true }); // mergeParams allows accessing :id from parent router

router.use(authenticateMiddleware);

/**
 * @openapi
 * /api/v1/incidents/{id}/evidence/upload-url:
 *   post:
 *     tags:
 *       - Evidence
 *     summary: Request S3 upload URL
 *     description: Generates a pre-signed S3 URL for direct client-to-S3 uploads.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The incident ID
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fileName, contentType, size]
 *             properties:
 *               fileName:
 *                 type: string
 *                 example: "wildlife.jpg"
 *               contentType:
 *                 type: string
 *                 example: "image/jpeg"
 *               size:
 *                 type: integer
 *                 example: 2458123
 *     responses:
 *       200:
 *         description: Upload URL generated
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
 *                     evidenceId:
 *                       type: string
 *                     uploadUrl:
 *                       type: string
 *                     s3Key:
 *                       type: string
 *                     expiresIn:
 *                       type: integer
 */
router.post("/upload-url", getUploadUrlController);

/**
 * @openapi
 * /api/v1/incidents/{id}/evidence:
 *   post:
 *     tags:
 *       - Evidence
 *     summary: Complete evidence upload
 *     description: Registers the uploaded S3 object with the incident.
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
 *             required: [evidenceId, type, s3Key, contentType]
 *             properties:
 *               evidenceId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [IMAGE, VIDEO]
 *               s3Key:
 *                 type: string
 *               contentType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Evidence registered
 */
router.post("/", completeUploadController);

export default router;
