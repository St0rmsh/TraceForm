import { redisConnection } from "../config/redis.js";

function rateLimitKey(projectId, windowStart) {
  return `traceform:ratelimit:${projectId}:${windowStart}`;
}

export async function rateLimiter(req, res, next) {
  const { rateLimit, id: projectId } = req.project;

  if (!rateLimit?.enabled) {
    return next();
  }

  const windowStart = Math.floor(Date.now() / 60000);
  const key = rateLimitKey(projectId, windowStart);

  try {
    const pipeline = redisConnection.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, 65);

    const results = await pipeline.exec();
    const currentCount = results[0][1];

    if (currentCount > rateLimit.requestsPerMinute) {
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded. Try again shortly.",
      });
    }

    res.set("X-RateLimit-Limit", String(rateLimit.requestsPerMinute));
    res.set("X-RateLimit-Remaining", String(Math.max(0, rateLimit.requestsPerMinute - currentCount)));

    next();
  } catch (err) {
    console.error("[gateway/rateLimiter] Redis error, failing open:", err.message);
    next();
  }
}