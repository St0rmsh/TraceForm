import { redisConnection } from "../config/redis.js";

function liveKeyPattern(runId) {
  return `traceform:loadtest:${runId}:live:*`;
}

export async function getLiveProgress(runId) {
  const keys = await redisConnection.keys(liveKeyPattern(runId));

  if (keys.length === 0) {
    return null;
  }

  const rawSnapshots = await redisConnection.mget(...keys);
  const snapshots = rawSnapshots.filter(Boolean).map((s) => JSON.parse(s));

  if (snapshots.length === 0) return null;

  const totalRequestsSoFar = snapshots.reduce((sum, s) => sum + (s.requestsSoFar || 0), 0);
  const maxElapsedSeconds = Math.max(...snapshots.map((s) => s.elapsedSeconds || 0));

  return {
    activePods: snapshots.length,
    totalRequestsSoFar,
    elapsedSeconds: maxElapsedSeconds,
    timestamp: new Date().toISOString(),
  };
}