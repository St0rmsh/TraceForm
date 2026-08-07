import { Router } from "express";
import { chaosState, resetChaosState } from "../state.js";

const router = Router();

// GET current chaos state — useful for the dashboard to reflect what's active
router.get("/", (req, res) => {
  res.status(200).json({ success: true, data: { chaosState } });
});

// PATCH partial update — set only the fields you want to change
router.patch("/", (req, res) => {
  const { extraLatencyMs, errorRatePercent, dependencyDown } = req.body;

  if (extraLatencyMs !== undefined) {
    if (typeof extraLatencyMs !== "number" || extraLatencyMs < 0) {
      return res.status(400).json({
        success: false,
        message: "extraLatencyMs must be a non-negative number",
      });
    }
    chaosState.extraLatencyMs = extraLatencyMs;
  }

  if (errorRatePercent !== undefined) {
    if (typeof errorRatePercent !== "number" || errorRatePercent < 0 || errorRatePercent > 100) {
      return res.status(400).json({
        success: false,
        message: "errorRatePercent must be a number between 0 and 100",
      });
    }
    chaosState.errorRatePercent = errorRatePercent;
  }

  if (dependencyDown !== undefined) {
    if (typeof dependencyDown !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "dependencyDown must be a boolean",
      });
    }
    chaosState.dependencyDown = dependencyDown;
  }

  res.status(200).json({
    success: true,
    message: "Chaos state updated",
    data: { chaosState },
  });
});

// reset everything back to normal — the "undo all chaos" button
router.post("/reset", (req, res) => {
  resetChaosState();

  res.status(200).json({
    success: true,
    message: "Chaos state reset to normal",
    data: { chaosState },
  });
});

export default router;