import { Router } from "express";
import {
  healthController,
  readinessController,
} from "./health.controller.js";

const router = Router();

router.get("/", healthController);
router.get("/ready", readinessController);

export default router;