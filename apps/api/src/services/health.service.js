import { redisConnection } from "../config/redis.js";
import { getProjectById } from "./project.service.js";

const HOT_LOG_FETCH_COUNT = 200; // matches the gateway's rolling window size

function hotLogKey(projectId) {
  return `traceform:hotlogs:${projectId}`;
}

function computeStatus(errorRatePercent, avgLatencyMs, thresholds) {
  const errorThreshold = thresholds.errorRatePercent;
  const latencyThreshold = thresholds.latencyMs;

  const isRed = errorRatePercent > errorThreshold || avgLatencyMs > latencyThreshold;
  const isYellow =
    errorRatePercent > errorThreshold * 0.6 || avgLatencyMs > latencyThreshold * 0.6;

  if (isRed) return "red";
  if (isYellow) return "yellow";
  return "green";
}

function summarizeRequests(requests, thresholds) {
  if (requests.length === 0) {
    return {
      status: "unknown",
      requestCount: 0,
      errorRatePercent: 0,
      avgLatencyMs: 0,
    };
  }

  const errorCount = requests.filter((r) => r.statusCode >= 500).length;
  const totalLatency = requests.reduce((sum, r) => sum + r.latencyMs, 0);

  const errorRatePercent = (errorCount / requests.length) * 100;
  const avgLatencyMs = totalLatency / requests.length;

  return {
    status: computeStatus(errorRatePercent, avgLatencyMs, thresholds),
    requestCount: requests.length,
    errorRatePercent: Math.round(errorRatePercent * 100) / 100,
    avgLatencyMs: Math.round(avgLatencyMs),
  };
}

// internal — no ownership check, used by both the REST endpoint (after its own
// ownership check) and the background anomaly scanner (which operates across
// all projects system-wide, not on behalf of any specific user)
export async function computeHealthSnapshot(project) {
  const projectId = project._id ? project._id.toString() : project.id;
  const raw = await redisConnection.lrange(hotLogKey(projectId), 0, HOT_LOG_FETCH_COUNT - 1);
  const requests = raw.map((r) => JSON.parse(r));

  const overall = summarizeRequests(requests, project.anomalyThresholds);

  const byRoute = new Map();
  for (const req of requests) {
    const key = `${req.method} ${req.path}`;
    if (!byRoute.has(key)) byRoute.set(key, []);
    byRoute.get(key).push(req);
  }

  const routes = Array.from(byRoute.entries()).map(([route, routeRequests]) => ({
    route,
    ...summarizeRequests(routeRequests, project.anomalyThresholds),
  }));

  return { projectId, overall, routes };
}

export async function getProjectHealth(projectId, userId) {
  // ownership check — reuses the same guard as every other project-scoped read
  const project = await getProjectById(projectId, userId);
  return computeHealthSnapshot(project);
}