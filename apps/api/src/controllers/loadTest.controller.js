import asyncHandler from "express-async-handler";
import {
  createLoadTest,
  listLoadTests,
  getLoadTestById,
  deleteLoadTest,
  compareLoadTests,
} from "../services/loadTest.service.js";
import { startLoadTest } from "../orchestration/orchestrator.service.js";
import { getLiveProgress } from "../orchestration/liveProgress.js";

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

export const start = asyncHandler(async (req, res) => {
  const result = await startLoadTest(req.params.runId, req.user.id);

  res.status(202).json({
    success: true,
    message: "Load test started",
    data: result,
  });
});


export const getLive = asyncHandler(async (req, res) => {
  const progress = await getLiveProgress(req.params.runId);
 
  res.status(200).json({
    success: true,
    data: { progress }, // null if no pods currently reporting
  });
});



export const compare = asyncHandler(async (req, res) => {
  const { baselineRunId, comparisonRunId } = req.query;
 
  if (!baselineRunId || !comparisonRunId) {
    return res.status(400).json({
      success: false,
      message: "Both baselineRunId and comparisonRunId query params are required",
    });
  }
 
  const result = await compareLoadTests(baselineRunId, comparisonRunId, req.user.id);
 
  res.status(200).json({
    success: true,
    data: result,
  });
});
