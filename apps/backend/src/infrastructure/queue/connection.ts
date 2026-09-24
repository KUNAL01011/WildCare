import { redis } from "@/infrastructure/redis/redis.client";

export function getQueueConnection() {
  if (!redis) {
    throw new Error("REDIS_URL is required for background jobs");
  }

  return redis;
}
