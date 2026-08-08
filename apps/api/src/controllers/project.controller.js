import asyncHandler from "express-async-handler";
import {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  deleteProject,
  regenerateApiKey,
} from "../services/project.service.js";
import { getProjectHealth } from "../services/health.service.js";

export const create = asyncHandler(async (req, res) => {
  const project = await createProject(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Project registered successfully",
    data: { project },
  });
});

export const list = asyncHandler(async (req, res) => {
  const projects = await listProjects(req.user.id);

  res.status(200).json({
    success: true,
    data: { projects },
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const project = await getProjectById(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: { project },
  });
});

export const update = asyncHandler(async (req, res) => {
  const project = await updateProject(req.params.id, req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: { project },
  });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteProject(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
});

export const regenerateKey = asyncHandler(async (req, res) => {
  const { apiKey } = await regenerateApiKey(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: "API key regenerated successfully",
    data: { apiKey },
  });
});


export const getHealth = asyncHandler(async (req, res) => {
  const health = await getProjectHealth(req.params.id, req.user.id);
 
  res.status(200).json({
    success: true,
    data: health,
  });
});