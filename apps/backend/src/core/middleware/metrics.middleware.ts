import type { Request, Response, NextFunction } from "express";
import {
  httpRequestDurationSeconds,
  httpRequestsTotal,
} from "../observability/metrics.js";

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if(req.path === "/metrics"){
    return next();
  }
  const end = httpRequestDurationSeconds.startTimer();

  res.on("finish", () => {
    // If req.route is undefined, the request hit no registered route (404/unmatched).
    // Using req.path here would create a unique label per URL segment (e.g. /api/users/1, /api/users/2)
    // which causes cardinality explosion in Prometheus — one time series per unique label combo.
    // "unknown" collapses all unmatched routes into a single safe label.
    const route = req.route
      ? req.baseUrl + req.route.path
      : "unknown";

    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode,
    };

    end(labels);
    httpRequestsTotal.inc(labels);
  });

  next();
}