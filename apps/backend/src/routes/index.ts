import { Router } from "express";

import authRoutes from "@/modules/auth/auth.route";
import reportRoutes from "@/modules/reports/reports.route";
import responderRoutes from "@/modules/responders/responders.route";
import feedbackRoutes from "@/modules/feedback/feedback.route";
import adminRoutes from "./admin.routes";

const router = Router();

// ─── Citizen APIs ───────────────────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/reports", reportRoutes);
router.use("/responders", responderRoutes);
router.use("/feedback", feedbackRoutes);

// ─── Admin APIs ─────────────────────────────────────────────────────────
router.use("/admin", adminRoutes);

export default router;
