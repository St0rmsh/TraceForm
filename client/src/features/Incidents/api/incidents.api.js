import { apiFetch } from "../../../api/client";

/* =========================================================
   CRUD
========================================================= */

export function createIncident(projectId, data) {
  return apiFetch(`/projects/${projectId}/incidents`, {
    method: "POST",

    body: JSON.stringify(data),
  });
}

export function fetchIncidents(projectId) {
  return apiFetch(`/projects/${projectId}/incidents`);
}

export function fetchIncident(incidentId) {
  return apiFetch(`/incidents/${incidentId}`);
}

/* =========================================================
   AI ANALYSIS
========================================================= */

export function analyzeRootCause(incidentId) {
  return apiFetch(`/incidents/${incidentId}/analyze`, {
    method: "POST",
  });
}

export function summarizeIncident(incidentId) {
  return apiFetch(`/incidents/${incidentId}/summarize`, {
    method: "POST",
  });
}

/* =========================================================
   TIMELINE
========================================================= */

export function addTimelineEntry(incidentId, data) {
  return apiFetch(`/incidents/${incidentId}/timeline`, {
    method: "POST",

    body: JSON.stringify(data),
  });
}

export function fetchTimeline(incidentId) {
  return apiFetch(`/incidents/${incidentId}/timeline`);
}

/* =========================================================
   RESOLUTION
========================================================= */

export function resolveIncident(incidentId, data) {
  return apiFetch(`/incidents/${incidentId}/resolve`, {
    method: "POST",

    body: JSON.stringify(data),
  });
}

export function reopenIncident(incidentId) {
  return apiFetch(`/incidents/${incidentId}/reopen`, {
    method: "POST",
  });
}