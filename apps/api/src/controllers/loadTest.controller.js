import asyncHandler from "express-async-handler";
import {
  createLoadTest,
  listLoadTests,
  getLoadTestById,
  deleteLoadTest,
  assertRunOwnership,
} from "../services/loadTest.service.js";
import { startLoadTest } from "../orchestration/loadTestOrchestrator.js";

export const create = asyncHandler(async (req, res) => {
  const run = await createLoadTest(req.params.projectId, req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Load test configured successfully",
    data: { run },
  });
});

export const list = asyncHandler(async (req, res) => {
  const runs = await listLoadTests(req.params.projectId, req.user.id);

  res.status(200).json({
    success: true,
    data: { runs },
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const run = await getLoadTestById(req.params.runId, req.user.id);

  res.status(200).json({
    success: true,
    data: { run },
  });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteLoadTest(req.params.runId, req.user.id);

  res.status(200).json({
    success: true,
    message: "Load test run deleted successfully",
  });
});