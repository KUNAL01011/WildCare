import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import healthRoutes from "./core/health/health.route.js";
import { swaggerSpec } from "./config/swagger.js";

import { requestLogger } from "./core/middleware/request-logger.middleware.js";
import { apiRateLimiter } from "./core/middleware/rate-limit.middleware.js";
import { errorHandler, notFoundHandler } from "./core/errors/error-handler.js";
import routes from "./routes/index.js";

const app = express();

// 1. Security
app.use(helmet());

// 2. Cross-origin requests
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// 3. Performance
app.use(compression());

// 4. Parse incoming requests
app.use(express.json());
app.use(cookieParser());

// 5. Request-level middleware
app.use(requestLogger);

// 6. Protection
app.use(apiRateLimiter);

// 7. Infrastructure routes
app.use("/health", healthRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 8. Application routes
app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
