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

export { sanitizeRun, assertRunOwnership };