import { Router, type Request, type Response } from "express";
import { asyncHandler } from "@/core/middleware/async-handler.middleware";
import { adminLoginSchema } from "./admin-auth.schema";
import * as adminAuthService from "./admin-auth.service";

const router = Router();

router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = adminLoginSchema.parse(req.body);
    const result = await adminAuthService.adminLogin(email, password);
    res.json({ success: true, data: result });
  })
);

export default router;
