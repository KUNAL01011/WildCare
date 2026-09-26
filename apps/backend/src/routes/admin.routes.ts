import { Router } from "express";
import { adminAuthMiddleware } from "@/core/middleware/auth.middleware";

import adminAuthRoutes from "@/modules/admin/auth/admin-auth.route";
import adminDashboardRoutes from "@/modules/admin/dashboard/dashboard.route";
import adminCitizensRoutes from "@/modules/admin/citizens/citizens.route";
import adminReportsRoutes from "@/modules/admin/reports/admin-reports.route";
import adminBodiesRoutes from "@/modules/admin/bodies/bodies.route";
import adminFeedbackRoutes from "@/modules/admin/feedback/admin-feedback.route";
import adminLocationsRoutes from "@/modules/admin/locations/locations.route";
import adminAnalyticsRoutes from "@/modules/admin/analytics/analytics.route";

const router = Router();

router.use("/auth", adminAuthRoutes);

// All other admin routes require admin auth
router.use(adminAuthMiddleware);

router.use("/dashboard", adminDashboardRoutes);
router.use("/citizens", adminCitizensRoutes);
router.use("/reports", adminReportsRoutes);
router.use("/bodies", adminBodiesRoutes);
router.use("/feedback", adminFeedbackRoutes);
router.use("/locations", adminLocationsRoutes);
router.use("/analytics", adminAnalyticsRoutes);

export default router;
