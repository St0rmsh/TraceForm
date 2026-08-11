import {
  createLoadTest,
  fetchLoadTests,
  fetchLoadTest,
  deleteLoadTest,
  startLoadTest,
  fetchLiveProgress,
  compareLoadTests,
} from "../api/loadTests.api";

/* =========================================================
   CRUD
========================================================= */

export async function create(projectId, data) {
  const res = await createLoadTest(projectId, data);

  return res.data.run;
}

export async function list(projectId) {
  const res = await fetchLoadTests(projectId);

  return res.data.runs;
}

export async function getById(runId) {
  const res = await fetchLoadTest(runId);

  return res.data.run;
}

export async function remove(runId) {
  await deleteLoadTest(runId);

  return runId;
}

/* =========================================================
   EXECUTION
========================================================= */

export async function start(runId) {
  const res = await startLoadTest(runId);

  return res.data;
}

export async function getLiveProgress(runId) {
  const res = await fetchLiveProgress(runId);

  return res.data.progress;
}

/* =========================================================
   COMPARISON
========================================================= */

export async function compare(baselineRunId, comparisonRunId) {
  const res = await compareLoadTests(baselineRunId, comparisonRunId);

  return res.data;
}