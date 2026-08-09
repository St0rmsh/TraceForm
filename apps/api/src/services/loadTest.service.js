import LoadTestRun from "@traceform/shared/models/LoadTestRun.model.js";
import { getProjectById } from "./project.service.js";

function sanitizeRun(run) {
  return {
    id: run._id,
    project: run.project,
    name: run.name,
    config: run.config,
    chaos: run.chaos,
    status: run.status,
    results: run.results,
    aiAnalysis: run.aiAnalysis,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    createdAt: run.createdAt,
  };
}

async function assertRunOwnership(runId, userId) {
  const run = await LoadTestRun.findById(runId);

  if (!run) {
    const error = new Error("Load test run not found");
    error.statusCode = 404;
    throw error;
  }

  await getProjectById(run.project.toString(), userId);

  return run;
}

export async function createLoadTest(projectId, userId, data) {
  await getProjectById(projectId, userId);

  const run = await LoadTestRun.create({
    project: projectId,
    createdBy: userId,
    name: data.name,
    config: data.config,
    chaos: data.chaos || {},
  });

  return sanitizeRun(run);
}

export async function listLoadTests(projectId, userId) {
  await getProjectById(projectId, userId);

  const runs = await LoadTestRun.find({ project: projectId }).sort({ createdAt: -1 });
  return runs.map(sanitizeRun);
}

export async function getLoadTestById(runId, userId) {
  const run = await assertRunOwnership(runId, userId);
  return sanitizeRun(run);
}

export async function deleteLoadTest(runId, userId) {
  const run = await assertRunOwnership(runId, userId);

  if (run.status === "running" || run.status === "queued") {
    const error = new Error("Cannot delete a run that is queued or in progress");
    error.statusCode = 409;
    throw error;
  }

  await LoadTestRun.findByIdAndDelete(runId);
}


function computeDelta(baselineValue, comparisonValue) {
  const delta = comparisonValue - baselineValue;
  const percentChange = baselineValue !== 0 ? Math.round((delta / baselineValue) * 10000) / 100 : null;

  return { delta: Math.round(delta * 100) / 100, percentChange };
}

export async function compareLoadTests(baselineRunId, comparisonRunId, userId) {
  const baseline = await assertRunOwnership(baselineRunId, userId);
  const comparison = await assertRunOwnership(comparisonRunId, userId);

  if (baseline.status !== "completed" || comparison.status !== "completed") {
    const error = new Error("Both runs must be completed to compare results");
    error.statusCode = 409;
    throw error;
  }

  const metrics = [
    "totalRequests",
    "successCount",
    "errorCount",
    "avgLatencyMs",
    "p95LatencyMs",
    "p99LatencyMs",
    "maxLatencyMs",
    "throughputRps",
  ];

  const deltas = {};
  for (const metric of metrics) {
    deltas[metric] = computeDelta(baseline.results[metric], comparison.results[metric]);
  }

  return {
    baseline: sanitizeRun(baseline),
    comparison: sanitizeRun(comparison),
    deltas,
  };
}

export { sanitizeRun, assertRunOwnership };