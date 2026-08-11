import Incident from "@traceform/shared/models/Incident.model.js";
import { getProjectById } from "./project.service.js";
import Project from "@traceform/shared/models/Project.model.js";
import { runRootCauseChain } from "../agents/rootCause/graph.js";
import { generateSummary } from "../agents/incidentSummary.agent.js";


function sanitizeIncident(incident) {
  return {
    id: incident._id,
    project: incident.project,
    title: incident.title,
    description: incident.description,
    triggeredBy: incident.triggeredBy,
    severity: incident.severity,
    status: incident.status,
    healthSnapshot: incident.healthSnapshot,
    rootCauseAnalysis: incident.rootCauseAnalysis,
    aiSummary: incident.aiSummary,
    timeline: incident.timeline,
    resolvedAt: incident.resolvedAt,
    resolutionNotes: incident.resolutionNotes,
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt,
  };
}

function deriveSeverity(snapshot, thresholds) {
  const errorSeverelyOver = snapshot.errorRatePercent >= thresholds.errorRatePercent * 2;
  const latencySeverelyOver = snapshot.avgLatencyMs >= thresholds.latencyMs * 2;

  if (errorSeverelyOver || latencySeverelyOver) return "critical";
  return "high";
}

export async function createIncidentFromAnomaly(project, snapshot) {
  const severity = deriveSeverity(snapshot.overall, project.anomalyThresholds);

  const incident = await Incident.create({
    project: project._id,
    title: `Anomaly detected on ${project.name}`,
    description: `Automatically detected: error rate ${snapshot.overall.errorRatePercent}%, avg latency ${snapshot.overall.avgLatencyMs}ms.`,
    triggeredBy: "auto",
    severity,
    healthSnapshot: snapshot.overall,
    timeline: [
      {
        event: "detected",
        message: `Anomaly auto-detected: status=${snapshot.overall.status}, errorRate=${snapshot.overall.errorRatePercent}%, avgLatency=${snapshot.overall.avgLatencyMs}ms`,
      },
    ],
  });

  console.log(`[incident] Created incident ${incident._id} for project ${project.name}`);
  return sanitizeIncident(incident);
}

export async function createManualIncident(projectId, userId, { title, description }) {
  await getProjectById(projectId, userId);

  const incident = await Incident.create({
    project: projectId,
    title,
    description: description || "",
    triggeredBy: "manual",
    createdBy: userId,
    severity: "medium",
    timeline: [
      {
        event: "created",
        message: "Incident manually opened by user",
      },
    ],
  });

  return sanitizeIncident(incident);
}

export async function listIncidents(projectId, userId) {
  await getProjectById(projectId, userId);

  const incidents = await Incident.find({ project: projectId }).sort({ createdAt: -1 });
  return incidents.map(sanitizeIncident);
}

export async function assertIncidentOwnership(incidentId, userId) {
  const incident = await Incident.findById(incidentId);

  if (!incident) {
    const error = new Error("Incident not found");
    error.statusCode = 404;
    throw error;
  }

  await getProjectById(incident.project.toString(), userId);

  return incident;
}

export async function getIncidentById(incidentId, userId) {
  const incident = await assertIncidentOwnership(incidentId, userId);
  return sanitizeIncident(incident);
}

export async function analyzeRootCause(incidentId, userId) {
  const incident = await assertIncidentOwnership(incidentId, userId);
  const project = await Project.findById(incident.project);

  const result = await runRootCauseChain(incident, project);

  if (!result || !result.rootCause) {
    const error = new Error(
      "Root-cause analysis unavailable (AI provider not configured, quota exhausted, or call failed)"
    );
    error.statusCode = 503;
    throw error;
  }

  incident.rootCauseAnalysis = {
    rootCause: result.rootCause,
    confidence: result.confidence,
    contributingFactors: result.contributingFactors,
    analyzedAt: new Date(),
  };

  incident.timeline.push({
    event: "root_cause_analysis",
    message: `AI root-cause analysis completed (confidence: ${result.confidence})`,
  });

  await incident.save();
  return sanitizeIncident(incident);
}



export async function summarizeIncident(incidentId, userId) {
  const incident = await assertIncidentOwnership(incidentId, userId);

  const result = await generateSummary(incident);

  if (!result || !result.summary) {
    const error = new Error(
      "Incident summary unavailable (AI provider not configured, quota exhausted, or call failed)"
    );
    error.statusCode = 503;
    throw error;
  }

  incident.aiSummary = {
    summary: result.summary,
    runbookSteps: result.runbookSteps,
    generatedAt: new Date(),
  };

  incident.timeline.push({
    event: "ai_summary",
    message: "AI incident summary generated",
  });

  await incident.save();
  return sanitizeIncident(incident);
}



export async function addTimelineEntry(incidentId, userId, { event, message }) {
  const incident = await assertIncidentOwnership(incidentId, userId);

  incident.timeline.push({ event, message });

  // "investigating" is both a timeline event and a meaningful status
  // transition — link them so the incident's own status reflects reality
  if (event === "investigating" && incident.status === "open") {
    incident.status = "investigating";
  }

  await incident.save();
  return sanitizeIncident(incident);
}

export async function getTimeline(incidentId, userId) {
  const incident = await assertIncidentOwnership(incidentId, userId);
  return incident.timeline;
}



export async function resolveIncident(incidentId, userId, { resolutionNotes }) {
  const incident = await assertIncidentOwnership(incidentId, userId);

  if (incident.status === "resolved") {
    const error = new Error("Incident is already resolved");
    error.statusCode = 409;
    throw error;
  }

  incident.status = "resolved";
  incident.resolvedAt = new Date();
  incident.resolutionNotes = resolutionNotes;

  incident.timeline.push({
    event: "resolved",
    message: resolutionNotes,
  });

  await incident.save();
  return sanitizeIncident(incident);
}

export async function reopenIncident(incidentId, userId) {
  const incident = await assertIncidentOwnership(incidentId, userId);

  if (incident.status !== "resolved") {
    const error = new Error("Incident is not currently resolved");
    error.statusCode = 409;
    throw error;
  }

  incident.status = "open";
  incident.resolvedAt = null;

  incident.timeline.push({
    event: "reopened",
    message: "Incident reopened",
  });

  await incident.save();
  return sanitizeIncident(incident);
}

export { sanitizeIncident };