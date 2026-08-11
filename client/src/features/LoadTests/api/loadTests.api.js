import { apiFetch } from "../../../api/client";

/* =========================================================
   CRUD
========================================================= */

export function createLoadTest(projectId, data) {
  return apiFetch(`/projects/${projectId}/load-tests`, {
    method: "POST",

    body: JSON.stringify(data),
  });
}

export function fetchLoadTests(projectId) {
  return apiFetch(`/projects/${projectId}/load-tests`);
}

export function fetchLoadTest(runId) {
  return apiFetch(`/load-tests/${runId}`);
}

export function deleteLoadTest(runId) {
  return apiFetch(`/load-tests/${runId}`, {
    method: "DELETE",
  });
}

/* =========================================================
   EXECUTION
========================================================= */

export function startLoadTest(runId) {
  return apiFetch(`/load-tests/${runId}/start`, {
    method: "POST",
  });
}

export function fetchLiveProgress(runId) {
  return apiFetch(`/load-tests/${runId}/live`);
}

/* =========================================================
   COMPARISON
========================================================= */

export function compareLoadTests(baselineRunId, comparisonRunId) {
  return apiFetch(
    `/load-tests/compare?baselineRunId=${baselineRunId}&comparisonRunId=${comparisonRunId}`
  );
}