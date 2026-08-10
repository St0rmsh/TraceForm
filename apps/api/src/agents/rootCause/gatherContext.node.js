import RequestLog from "@traceform/shared/models/RequestLog.model.js";
import LoadTestRun from "@traceform/shared/models/LoadTestRun.model.js";

const RECENT_REQUEST_LIMIT = 50;
const RECENT_RUN_LIMIT = 3;

export async function gatherContext(state) {
  const { incident, project } = state;

  const [recentRequests, recentRuns] = await Promise.all([
    RequestLog.find({ project: project._id })
      .sort({ timestamp: -1 })
      .limit(RECENT_REQUEST_LIMIT)
      .lean(),
    LoadTestRun.find({ project: project._id, status: "completed" })
      .sort({ completedAt: -1 })
      .limit(RECENT_RUN_LIMIT)
      .lean(),
  ]);

  const routeBreakdown = new Map();
  for (const req of recentRequests) {
    const key = `${req.method} ${req.path}`;
    if (!routeBreakdown.has(key)) {
      routeBreakdown.set(key, { count: 0, errors: 0, totalLatency: 0 });
    }
    const entry = routeBreakdown.get(key);
    entry.count += 1;
    entry.totalLatency += req.latencyMs;
    if (req.statusCode >= 500) entry.errors += 1;
  }

  const routeSummary = Array.from(routeBreakdown.entries()).map(([route, data]) => ({
    route,
    requestCount: data.count,
    errorCount: data.errors,
    avgLatencyMs: Math.round(data.totalLatency / data.count),
  }));

  const runSummary = recentRuns.map((run) => ({
    name: run.name,
    config: { route: run.config.route, endRps: run.config.endRps, concurrency: run.config.concurrency },
    chaos: run.chaos,
    results: run.results,
    aiAnalysis: run.aiAnalysis,
    completedAt: run.completedAt,
  }));

  return {
    ...state,
    context: {
      project: {
        name: project.name,
        anomalyThresholds: project.anomalyThresholds,
      },
      incident: {
        title: incident.title,
        triggeredBy: incident.triggeredBy,
        healthSnapshot: incident.healthSnapshot,
        detectedAt: incident.createdAt,
      },
      routeSummary,
      recentLoadTests: runSummary,
    },
  };
}