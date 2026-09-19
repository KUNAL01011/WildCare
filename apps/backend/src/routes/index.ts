import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import organizationRoutes from "../modules/organizations/organization.routes.js";
import responderRoutes from "../modules/responders/responder.routes.js";
import incidentRoutes from "../modules/incidents/incident.routes.js";
import evidenceRoutes from "../modules/evidence/evidence.routes.js";
import aiAnalysisRoutes from "../modules/ai-analysis/ai-analysis.routes.js";
import assignmentRoutes from "../modules/assignments/assignment.routes.js";
import dispatchRoutes from "../modules/dispatch/dispatch.routes.js";
import notificationRoutes from "../modules/notifications/notification.routes.js";

const router = Router();

// Base routes
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/organizations", organizationRoutes);
router.use("/responders", responderRoutes);
router.use("/notifications", notificationRoutes);

// Incidents and nested sub-routes
router.use("/incidents", incidentRoutes);
router.use("/incidents/:id/evidence", evidenceRoutes);
router.use("/incidents/:id/analyze", aiAnalysisRoutes);
router.use("/incidents/:id", assignmentRoutes); // Resolves to /incidents/:id/assignment
router.use("/incidents/:id", dispatchRoutes); // Resolves to /incidents/:id/dispatches

export default router;
