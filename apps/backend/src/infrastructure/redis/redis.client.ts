import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/core/logger/logger";

const globalForRedis = globalThis as unknown as { redis?: Redis | null };
const isProd = env.NODE_ENV === "production";

function createRedisClient(): Redis | null {
  if (!env.REDIS_URL) {
    logger.warn(
      "REDIS_URL not set — running without cache / distributed rate-limit"
    );
    return null;
  }

  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: false,
    // Don't let a Redis outage take the process down; retry with backoff.
    retryStrategy: times => Math.min(times * 200, 2000),
  });

  client.on("error", error => logger.warn(`Redis error: ${error.message}`));
  client.on("connect", () => logger.info("✅ Redis connected"));

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (isProd) {
  globalForRedis.redis = redis;
}

export async function cacheGet(key: string): Promise<string | null> {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, "EX", ttlSeconds);
  } catch {
    // best-effort
  }
}

export async function cacheDel(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // best-effort
  }
}

export async function incrementWindow(
  key: string,
  windowSeconds: number
): Promise<number | null> {
  if (!redis) return null;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    return count;
  } catch {
    return null;
  }
}

// ... (your existing Redis code and cache functions)

export async function connectRedis(): Promise<void> {
  if (!redis) return;
  if (redis.status === "ready") return;

  return new Promise((resolve, reject) => {
    redis.once("ready", () => resolve());
    redis.once("error", err => reject(err));
  });
}

export async function disconnectRedis(): Promise<void> {
  if (!redis) return;
  try {
    await redis.quit();
    logger.info("Redis disconnected");
  } catch (error) {
    logger.error({ error }, "Error disconnecting from Redis");
  }
}
