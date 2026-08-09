import Project from "@traceform/shared/models/Project.model.js";
import LoadTestRun from "@traceform/shared/models/LoadTestRun.model.js";
import { batchApi, NAMESPACE } from "./k8sClient.js";
import { buildLoadTestJob, getJobName } from "./jobBuilder.js";
import { redisConnection } from "../config/redis.js";
import { assertRunOwnership } from "../services/loadTest.service.js";
import { applyChaos, resetChaos } from "./chaosController.js";
import { analyzeBottleneck } from "../agents/bottleneckAnalysis.agent.js";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_BUFFER_MS = 60000; // grace period beyond the run's own duration

function podResultsKey(runId) {
  return `traceform:loadtest:${runId}:podresults`;
}

async function pollJobUntilComplete(jobName, expectedPodCount, timeoutMs) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const { body: job } = await batchApi.readNamespacedJobStatus(jobName, NAMESPACE);
    const succeeded = job.status?.succeeded || 0;
    const failed = job.status?.failed || 0;

    if (succeeded + failed >= expectedPodCount) {
      return { succeeded, failed, timedOut: false };
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  return { succeeded: 0, failed: 0, timedOut: true };
}

function aggregatePodResults(rawResults) {
  const parsed = rawResults.map((r) => JSON.parse(r));
  const successful = parsed.filter((r) => !r.failed);

  if (successful.length === 0) {
    return null; // every pod failed — caller decides how to handle
  }

  const totalRequests = successful.reduce((sum, r) => sum + r.totalRequests, 0);
  const successCount = successful.reduce((sum, r) => sum + r.successCount, 0);
  const errorCount = successful.reduce((sum, r) => sum + r.errorCount, 0);
  const throughputRps = successful.reduce((sum, r) => sum + r.throughputRps, 0);

  // weighted average latency by request volume per pod
  const weightedLatencySum = successful.reduce(
    (sum, r) => sum + r.avgLatencyMs * r.totalRequests,
    0
  );
  const avgLatencyMs = totalRequests > 0 ? weightedLatencySum / totalRequests : 0;

  // percentiles can't be mathematically combined across independent samples —
  // taking the max across pods is a conservative (worst-case) approximation,
  // a documented simplification rather than statistically precise merging
  const p95LatencyMs = Math.max(...successful.map((r) => r.p95LatencyMs));
  const p99LatencyMs = Math.max(...successful.map((r) => r.p99LatencyMs));
  const maxLatencyMs = Math.max(...successful.map((r) => r.maxLatencyMs));

  return {
    totalRequests,
    successCount,
    errorCount,
    avgLatencyMs: Math.round(avgLatencyMs),
    p95LatencyMs: Math.round(p95LatencyMs),
    p99LatencyMs: Math.round(p99LatencyMs),
    maxLatencyMs: Math.round(maxLatencyMs),
    throughputRps: Math.round(throughputRps * 100) / 100,
  };
}

async function cleanupJob(jobName) {
  try {
    await batchApi.deleteNamespacedJob(jobName, NAMESPACE, undefined, undefined, undefined, undefined, "Background");
  } catch (err) {
    console.error(`[orchestrator] Failed to clean up job ${jobName}:`, err.message);
  }
}

export async function startLoadTest(runId, userId) {
  const run = await assertRunOwnership(runId, userId);

  if (run.status !== "pending") {
    const error = new Error(`Cannot start a run with status "${run.status}"`);
    error.statusCode = 409;
    throw error;
  }

  // needs the raw apiKey, which the sanitized project service deliberately excludes
  const project = await Project.findById(run.project).select("+apiKey");
  if (!project) {
    const error = new Error("Parent project not found");
    error.statusCode = 404;
    throw error;
  }

  const jobManifest = buildLoadTestJob(run, project);
  const jobName = jobManifest.metadata.name;
  const podCount = jobManifest.spec.parallelism;

  run.status = "queued";
  run.startedAt = new Date();
  await run.save();

  // fire the actual orchestration asynchronously — the API responds immediately,
  // status updates happen in the background as the job progresses
  runInBackground(run, jobManifest, jobName, podCount, project.targetBaseUrl);

  return { runId: run._id, status: run.status, jobName };
}

async function runInBackground(run, jobManifest, jobName, podCount, targetBaseUrl) {
  let chaosWasApplied = false;

  try {
    const chaosResult = await applyChaos(targetBaseUrl, run.chaos);
    chaosWasApplied = chaosResult.applied;

    await batchApi.createNamespacedJob(NAMESPACE, jobManifest);

    run.status = "running";
    await run.save();

    const timeoutMs = run.config.durationSeconds * 1000 + POLL_TIMEOUT_BUFFER_MS;
    const { timedOut } = await pollJobUntilComplete(jobName, podCount, timeoutMs);

    const rawResults = await redisConnection.lrange(podResultsKey(run._id.toString()), 0, -1);

    if (timedOut || rawResults.length === 0) {
      run.status = "failed";
      run.completedAt = new Date();
      await run.save();
      await cleanupJob(jobName);
      return;
    }

   const aggregated = aggregatePodResults(rawResults);

    if (!aggregated) {
      run.status = "failed";
    } else {
      run.results = aggregated;
      run.status = "completed";
      run.aiAnalysis = await analyzeBottleneck(run); // null if unavailable — never blocks completion
    }

    run.completedAt = new Date();
    await run.save();
    await cleanupJob(jobName);
  } catch (err) {
    console.error(`[orchestrator] Run ${run._id} failed:`, err.message);
    run.status = "failed";
    run.completedAt = new Date();
    await run.save().catch(() => {});
    await cleanupJob(jobName);
  } finally {
    // guaranteed regardless of outcome — a chaos-injected target must
    // never be left in a degraded state after the run ends
    if (chaosWasApplied) {
      await resetChaos(targetBaseUrl);
    }
  }
}

export async function getLiveProgress(runId, userId) {
  await assertRunOwnership(runId, userId);

  const rawResults = await redisConnection.lrange(podResultsKey(runId), 0, -1);
  if (rawResults.length === 0) {
    return null; // no live reporting pods
  }

  const parsed = rawResults.map((r) => JSON.parse(r));

  const totalRequests = parsed.reduce((sum, r) => sum + r.requestsSoFar, 0);
  const maxElapsedSeconds = Math.max(...parsed.map((r) => r.elapsedSeconds));

  return {
    totalRequests,
    elapsedSeconds: maxElapsedSeconds,
  };
}