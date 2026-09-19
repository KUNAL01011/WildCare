import type { Request, Response } from "express";
import { asyncHandler } from "../../core/middleware/async-handler.middleware.js";
import {
  createDispatchConfigSchema,
  createResponderSchema,
  createServiceAreaSchema,
  verifyOrganizationSchema,
} from "./admin.validation.js";
import {
  configureDispatchChannel,
  configureServiceArea,
  provisionResponder,
  verifyOrganization,
} from "./admin.service.js";

export const verifyOrganizationController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = verifyOrganizationSchema.parse(req.body);
    const result = await verifyOrganization(
      req.params.id as string,
      req.user!,
      input
    );
    res.status(200).json({ success: true, data: result });
  }
);

export const provisionResponderController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createResponderSchema.parse(req.body);
    const result = await provisionResponder(req.user!, input);
    res.status(201).json({ success: true, data: result });
  }
);

export const configureServiceAreaController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createServiceAreaSchema.parse(req.body);
    const result = await configureServiceArea(
      req.params.id as string,
      req.user!,
      input
    );
    res.status(201).json({ success: true, data: result });
  }
);

export const configureDispatchChannelController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createDispatchConfigSchema.parse(req.body);
    const result = await configureDispatchChannel(
      req.params.id as string,
      req.user!,
      input
    );
    res.status(201).json({ success: true, data: result });
  }
);
