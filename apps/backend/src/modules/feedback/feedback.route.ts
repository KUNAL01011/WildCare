import { Router, type Request, type Response } from "express";
import { asyncHandler } from "@/core/middleware/async-handler.middleware";
import { authenticateMiddleware } from "@/core/middleware/auth.middleware";
import { submitFeedbackSchema } from "./feedback.schema";
import * as feedbackService from "./feedback.service";

const router = Router();

// Feedback is nested under reports in the mobile app:
// POST /reports/:reportId/feedback
// But the route index mounts this at /feedback
// We need to add the report-scoped feedback route to the reports router instead
// This module provides the service; the route is handled in reports.route.ts

// For any standalone feedback routes (if needed)
router.use(authenticateMiddleware);

export default router;
