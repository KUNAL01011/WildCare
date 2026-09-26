import express, { type Application } from "express";
import path from "node:path";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import { env } from "@/config/env";
import { swaggerSpec } from "@/config/swagger";

import { apiRateLimiter } from "@/core/middleware/rate-limit.middleware";

import { errorHandler, notFoundHandler } from "@/core/errors/error-handler";
import { requestLogger } from "./core/logger/http.logger";

// routes
import healthRoutes from "./modules/health/health.route";
import apiRoutes from "./routes/index";

const app: Application = express();

/**
 * =========================================================
 * APPLICATION CONFIGURATION
 * =========================================================
 */

app.set("trust proxy", 1);
app.disable("x-powered-by");

/**
 * =========================================================
 * SECURITY
 * =========================================================
 */

app.use(
  helmet({
    crossOriginOpenerPolicy: {
      policy: "same-origin-allow-popups",
    },
  })
);

app.use(
  cors({
    origin: env.CORSORIGINS.split(",").map(s => s.trim()),
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

/**
 * =========================================================
 * PERFORMANCE
 * =========================================================
 */

app.use(compression());

/**
 * =========================================================
 * BODY PARSING
 * =========================================================
 *
 * IMPORTANT:
 * Webhook routes that require the raw request body must be
 * registered BEFORE these parsers.
 */

// Razorpay webhook — needs the raw body to verify the HMAC signature, so it is
// registered here BEFORE express.json(). It is not rate-limited by the API
// limiter (Razorpay may burst-retry) — the signature check is its gate.
// app.post(
//   "/api/v1/webhooks/razorpay",
//   express.raw({ type: "*/*", limit: "1mb" }),
//   razorpayWebhook
// );

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(cookieParser());

/**
 * =========================================================
 * OBSERVABILITY
 * =========================================================
 */
app.use(requestLogger);

/**
 * =========================================================
 * INFRASTRUCTURE
 * =========================================================
 */
app.use("/health", healthRoutes);

if (env.NODE_ENV !== "production") {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

/**
 * =========================================================
 * APPLICATION API
 * =========================================================
 */

app.use("/api/v1", apiRateLimiter, apiRoutes);

/**
 * =========================================================
 * ERROR HANDLING
 * =========================================================
 *
 * These MUST remain last.
 */

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
