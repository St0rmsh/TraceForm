import {
  createIncident,
  fetchIncidents,
  fetchIncident,
  analyzeRootCause,
  summarizeIncident,
  addTimelineEntry,
  fetchTimeline,
  resolveIncident,
  reopenIncident,
} from "../api/incidents.api";

/* =========================================================
   CRUD
========================================================= */

export async function create(projectId, data) {
  const res = await createIncident(projectId, data);

  return res.data.incident;
}

export async function list(projectId) {
  const res = await fetchIncidents(projectId);

  return res.data.incidents;
}

export async function getById(incidentId) {
  const res = await fetchIncident(incidentId);

  return res.data.incident;
}

/* =========================================================
   AI ANALYSIS
========================================================= */

export async function runRootCauseAnalysis(incidentId) {
  const res = await analyzeRootCause(incidentId);

  return res.data.incident;
}

export async function generateSummary(incidentId) {
  const res = await summarizeIncident(incidentId);

  return res.data.incident;
}

/* =========================================================
   TIMELINE
========================================================= */

export async function addEntry(incidentId, data) {
  const res = await addTimelineEntry(incidentId, data);

  return res.data.incident;
}

export async function getTimeline(incidentId) {
  const res = await fetchTimeline(incidentId);

  return res.data.timeline;
}

/* =========================================================
   RESOLUTION
========================================================= */

export async function resolve(incidentId, data) {
  const res = await resolveIncident(incidentId, data);

  return res.data.incident;
}

export async function reopen(incidentId) {
  const res = await reopenIncident(incidentId);

  return res.data.incident;
}