import { chaosState } from "../state.js";

export async function chaosInjector(req, res, next) {
  // simulate a downstream dependency being completely down
  if (chaosState.dependencyDown) {
    return res.status(503).json({
      success: false,
      message: "Service unavailable: downstream dependency is down",
    });
  }

  // random error injection at configured rate
  if (chaosState.errorRatePercent > 0) {
    const roll = Math.random() * 100;
    if (roll < chaosState.errorRatePercent) {
      return res.status(500).json({
        success: false,
        message: "Simulated internal server error",
      });
    }
  }

  // extra latency injection
  if (chaosState.extraLatencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, chaosState.extraLatencyMs));
  }

  next();
}