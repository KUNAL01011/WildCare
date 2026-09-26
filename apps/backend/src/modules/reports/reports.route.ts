import { Router, type Request, type Response } from "express";
import multer from "multer";
import { asyncHandler } from "@/core/middleware/async-handler.middleware";
import { authenticateMiddleware } from "@/core/middleware/auth.middleware";
import {
  listReportsSchema,
  updateReportSchema,
  contactAttemptSchema,
  updateResponseStatusSchema,
} from "./reports.schema";
import * as reportsService from "./reports.service";
import * as respondersService from "@/modules/responders/responders.service";
import * as feedbackService from "@/modules/feedback/feedback.service";
import { submitFeedbackSchema } from "@/modules/feedback/feedback.schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router = Router();
router.use(authenticateMiddleware);

router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const params = listReportsSchema.parse(req.query);
    const result = await reportsService.listReports(req.user!.id, params);
    res.json({ success: true, data: result });
  })
);

router.post(
  "/",
  upload.array("images[]", 3),
  asyncHandler(async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[]) ?? [];
    const latitude = parseFloat(req.body.latitude);
    const longitude = parseFloat(req.body.longitude);
    const incidentOccurredAt = req.body.incidentOccurredAt;

    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({
        success: false,
        error: { code: "LOCATION_REQUIRED", message: "Valid coordinates are required" },
      });
      return;
    }

    const result = await reportsService.createReport(
      req.user!.id,
      files,
      latitude,
      longitude,
      incidentOccurredAt
    );
    res.status(201).json({ success: true, data: result });
  })
);

router.get(
  "/:reportId",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await reportsService.getReportById(
      req.params.reportId,
      req.user!.id
    );
    res.json({ success: true, data: result });
  })
);

router.patch(
  "/:reportId",
  asyncHandler(async (req: Request, res: Response) => {
    const data = updateReportSchema.parse(req.body);
    const result = await reportsService.updateReport(
      req.params.reportId,
      req.user!.id,
      data
    );
    res.json({ success: true, data: result });
  })
);

router.post(
  "/:reportId/submit",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await reportsService.submitReport(
      req.params.reportId,
      req.user!.id
    );
    res.json({ success: true, data: result });
  })
);

router.post(
  "/:reportId/contact",
  asyncHandler(async (req: Request, res: Response) => {
    const { bodyId, type } = contactAttemptSchema.parse(req.body);
    const result = await reportsService.recordContactAttempt(
      req.params.reportId,
      req.user!.id,
      bodyId,
      type
    );
    res.json({ success: true, data: result });
  })
);

router.post(
  "/:reportId/response",
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = updateResponseStatusSchema.parse(req.body);
    const result = await reportsService.updateResponseStatus(
      req.params.reportId,
      req.user!.id,
      status
    );
    res.json({ success: true, data: result });
  })
);

// ─── Responder matching (nested under reports) ─────────────────────────

router.get(
  "/:reportId/responders",
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const result = await respondersService.getMatchedResponders(
      req.params.reportId,
      req.user!.id,
      limit
    );
    res.json({ success: true, data: result });
  })
);

// ─── Feedback (nested under reports) ────────────────────────────────────

router.post(
  "/:reportId/feedback",
  asyncHandler(async (req: Request, res: Response) => {
    const data = submitFeedbackSchema.parse(req.body);
    const result = await feedbackService.submitFeedback(
      req.params.reportId,
      req.user!.id,
      data
    );
    res.json({ success: true, data: result });
  })
);

export default router;
