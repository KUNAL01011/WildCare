import { pinoHttp } from "pino-http";
import { randomUUID } from "node:crypto";
import { logger } from "../../lib/logger.js";

export const requestLogger = pinoHttp({
  logger,

  genReqId: (req, res) => {
    const incomingRequestId = req.headers["x-request-id"];

    const requestId =
      typeof incomingRequestId === "string"
        ? incomingRequestId
        : randomUUID();

    res.setHeader("X-Request-ID", requestId);

    return requestId;
  },
});