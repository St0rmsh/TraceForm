import asyncHandler from "express-async-handler";
import {
  createManualIncident,
  listIncidents,
  getIncidentById,
  analyzeRootCause,
  summarizeIncident,
  getTimeline,
  addTimelineEntry,
  reopenIncident,
  resolveIncident,
} from "../services/incident.service.js";
import { getDashboard } from "../services/project.service.js";

export const create = asyncHandler(async (req, res) => {
  const incident = await createManualIncident(req.params.projectId, req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Incident created",
    data: { incident },
  });
});

export const list = asyncHandler(async (req, res) => {
  const incidents = await listIncidents(req.params.projectId, req.user.id);

  res.status(200).json({
    success: true,
    data: { incidents },
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const incident = await getIncidentById(req.params.incidentId, req.user.id);

  res.status(200).json({
    success: true,
    data: { incident },
  });
});


export const analyze = asyncHandler(async (req, res) => {
  const incident = await analyzeRootCause(req.params.incidentId, req.user.id);

  res.status(200).json({
    success: true,
    message: "Root-cause analysis complete",
    data: { incident },
  });
});




export const summarize = asyncHandler(async (req, res) => {
  const incident = await summarizeIncident(req.params.incidentId, req.user.id);

  res.status(200).json({
    success: true,
    message: "Incident summary generated",
    data: { incident },
  });
});




export const addEntry = asyncHandler(async (req, res) => {
  const incident = await addTimelineEntry(req.params.incidentId, req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Timeline entry added",
    data: { incident },
  });
});

export const getEntries = asyncHandler(async (req, res) => {
  const timeline = await getTimeline(req.params.incidentId, req.user.id);

  res.status(200).json({
    success: true,
    data: { timeline },
  });
});


export const resolve = asyncHandler(async (req, res) => {
  const incident = await resolveIncident(req.params.incidentId, req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: "Incident resolved",
    data: { incident },
  });
});

export const reopen = asyncHandler(async (req, res) => {
  const incident = await reopenIncident(req.params.incidentId, req.user.id);

  res.status(200).json({
    success: true,
    message: "Incident reopened",
    data: { incident },
  });
});


export const dashboard = asyncHandler(async (req, res) => {
  const data = await getDashboard(req.user.id);

  res.status(200).json({
    success: true,
    data: { dashboard: data },
  });
});