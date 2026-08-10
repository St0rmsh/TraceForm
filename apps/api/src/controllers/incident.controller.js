import asyncHandler from "express-async-handler";
import {
  createManualIncident,
  listIncidents,
  getIncidentById,
  analyzeRootCause,
} from "../services/incident.service.js";

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