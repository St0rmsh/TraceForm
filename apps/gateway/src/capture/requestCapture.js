import { redisConnection } from "../config/redis.js";

const HOT_LOG_MAX_ENTRIES = 200;
const FLUSH_QUEUE_KEY = "traceform:flushqueue";
const KEY_TTL_SECONDS = 30 * 60; // 30 minutes — keys self-expire if a project goes idle

function hotLogKey(projectId) {
  return `traceform:hotlogs:${projectId}`;
}

function liveChannel(projectId) {
  return `traceform:live:${projectId}`;
}

export async function captureRequest({ projectId, method, path, statusCode, latencyMs, ip }) {
  const entry = {
    project: projectId,
    method,
    path,
    statusCode,
    latencyMs,
    ip: ip || "",
    timestamp: new Date().toISOString(),
  };

  const serialized = JSON.stringify(entry);

  try {
    const pipeline = redisConnection.pipeline();

    pipeline.lpush(hotLogKey(projectId), serialized);
    pipeline.ltrim(hotLogKey(projectId), 0, HOT_LOG_MAX_ENTRIES - 1);
    pipeline.expire(hotLogKey(projectId), KEY_TTL_SECONDS);

    pipeline.lpush(FLUSH_QUEUE_KEY, serialized);
    pipeline.expire(FLUSH_QUEUE_KEY, KEY_TTL_SECONDS);

    pipeline.publish(liveChannel(projectId), serialized);

    await pipeline.exec();
  } catch (err) {
    console.error("[gateway/capture] Failed to write request log:", err.message);
  }
}