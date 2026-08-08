import LoadTestRun from "@traceform/shared/models/LoadTestRun.model.js";
import { batchApi, NAMESPACE } from "./k8sClient.js";
import { buildLoadTestJob, getJobName } from "./jobBuilder.js";
import { getProjectRawWithApiKey } from "../services/project.service.js";
import { redisConnection } from "../config/redis.js";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_BUFFER_MS = 60000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollJobUntilComplete(jobName, expectedCompletions, timeoutMs) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const { body } = await batchApi.readNamespacedJobStatus(jobName, NAMESPACE);
    const succeeded = body.status?.succeeded || 0;
    const failed = body.status?.failed || 0;

    if (succeeded + failed >= expectedCompletions) {
      return { succeeded, failed, timedOut: false };
    }

    await sleep(POLL_INTERVAL_MS);
  }

  return { succeeded: 0, failed: 0, timedOut: true };
}

function aggregateResults(podResults) {
  const validResults = podResults.filter((r) => !r.failed);

  if (validResults.length === 0) {
    return null;
  }

  const totalRequests = validResults.reduce((sum, r) => sum + r.totalRequests, 0);
  const successCount = validResults.reduce((sum, r) => sum + r.successCount, 0);
  const errorCount = validResults.reduce((sum, r) => sum + r.errorCount, 0);
  const throughputRps = validResults.reduce((sum, r) => sum + r.throughputRps, 0);
  const maxLatencyMs = Math.max(...validResults.map((r) => r.maxLatencyMs));

  const weightedLatencySum = validResults.reduce(
    (sum, r) => sum + r.avgLatencyMs * r.totalRequests,
    0
  );
  const avgLatencyMs = totalRequests > 0 ? weightedLatencySum / totalRequests : 0;

  const avgP95 = validResults.reduce((sum, r) => sum + r.p95LatencyMs, 0) / validResults.length;
  const avgP99 = validResults.reduce((sum, r) => sum + r.p99LatencyMs, 0) / validResults.length;

  return {
    totalRequests,
    successCount,
    errorCount,
    avgLatencyMs: Math.round(avgLatencyMs),
    p95LatencyMs: Math.round(avgP95),
    p99LatencyMs: Math.round(avgP99),
    maxLatencyMs: Math.round(maxLatencyMs),
    throughputRps: Math.round(throughputRps * 100) / 100,
  };
}

export async function startLoadTest(runId) {
  const run = await LoadTestRun.findById(runId);
  if (!run) throw new Error("Load test run not found");

  if (run.status !== "pending") {
    const error = new Error(`Cannot start a run with status "${run.status}"`);
    error.statusCode = 409;
    throw error;
  }

  const project = await getProjectRawWithApiKey(run.project.toString());

  const jobSpec = buildLoadTestJob(run, project);
  const podCount = jobSpec.spec.parallelism;

  run.status = "queued";
  await run.save();

  try {
    await batchApi.createNamespacedJob(NAMESPACE, jobSpec);

    run.status = "running";
    run.startedAt = new Date();
    await run.save();

    watchAndFinalize(run._id.toString(), getJobName(runId), podCount, run.config.durationSeconds);

    return { runId: run._id, status: run.status };
  } catch (err) {
    run.status = "failed";
    await run.save();
    throw new Error(`Failed to create K8s Job: ${err.message}`);
  }
}

async function watchAndFinalize(runId, jobName, podCount, durationSeconds) {
  const timeoutMs = durationSeconds * 1000 + POLL_TIMEOUT_BUFFER_MS;

  try {
    const { succeeded, timedOut } = await pollJobUntilComplete(jobName, podCount, timeoutMs);

    const resultsKey = `traceform:loadtest:${runId}:podresults`;
    const rawResults = await redisConnection.lrange(resultsKey, 0, -1);
    const podResults = rawResults.map((r) => JSON.parse(r));

    const aggregated = aggregateResults(podResults);

    const run = await LoadTestRun.findById(runId);
    if (!run) return;

    if (timedOut || !aggregated || succeeded < podCount) {
      run.status = "failed";
    } else {
      run.status = "completed";
      run.results = aggregated;
    }

    run.completedAt = new Date();
    await run.save();

    await redisConnection.del(resultsKey);

    console.log(`[orchestrator] Run ${runId} finished with status: ${run.status}`);
  } catch (err) {
    console.error(`[orchestrator] Error finalizing run ${runId}:`, err.message);

    const run = await LoadTestRun.findById(runId);
    if (run) {
      run.status = "failed";
      run.completedAt = new Date();
      await run.save();
    }
  }
}