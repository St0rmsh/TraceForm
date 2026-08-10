import Project from "@traceform/shared/models/Project.model.js";
import { computeHealthSnapshot } from "../services/health.service.js";
import { redisConnection } from "../config/redis.js";
import { createIncidentFromAnomaly } from "../services/incident.service.js";

const SCAN_INTERVAL_MS = 20000;
const ANOMALY_FLAG_TTL_SECONDS = 5 * 60;

function anomalyFlagKey(projectId) {
  return `traceform:anomaly:active:${projectId}`;
}

async function onAnomalyDetected(project, snapshot) {
  console.log(
    `[anomaly] DETECTED on project "${project.name}" (${project._id}) — ` +
      `status=${snapshot.overall.status} errorRate=${snapshot.overall.errorRatePercent}% ` +
      `avgLatency=${snapshot.overall.avgLatencyMs}ms`
  );

  await createIncidentFromAnomaly(project, snapshot);
}

async function scanProject(project) {
  const snapshot = await computeHealthSnapshot(project);

  if (snapshot.overall.status !== "red") {
    await redisConnection.del(anomalyFlagKey(project._id.toString()));
    return;
  }

  const flagKey = anomalyFlagKey(project._id.toString());
  const alreadyFlagged = await redisConnection.get(flagKey);

  if (alreadyFlagged) return;

  await redisConnection.set(flagKey, "1", "EX", ANOMALY_FLAG_TTL_SECONDS);
  await onAnomalyDetected(project, snapshot);
}

async function processScan() {
  try {
    const activeProjects = await Project.find({ status: "active" });
    const results = await Promise.allSettled(activeProjects.map(scanProject));

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.error(`[anomaly-worker] ${failures.length} project scan(s) failed:`, failures);
    }
  } catch (err) {
    console.error("[anomaly-worker] Scan cycle failed:", err.message);
  }
}

export function startAnomalyWorker() {
  console.log(`[anomaly-worker] Started (interval scan every ${SCAN_INTERVAL_MS / 1000}s)`);
  setInterval(processScan, SCAN_INTERVAL_MS);
}