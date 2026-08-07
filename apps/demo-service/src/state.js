// In-memory only — resets on restart. This is intentional: the demo service
// is a disposable target, not a system of record. Traceform's load-test/chaos
// module manipulates this state via /chaos/* endpoints to simulate degraded
// conditions without needing real infra manipulation for a synthetic target.

export const chaosState = {
  extraLatencyMs: 0, // added to every response
  errorRatePercent: 0, // 0-100, chance any request randomly 500s
  dependencyDown: false, // simulates a downstream dependency failure
};

export function resetChaosState() {
  chaosState.extraLatencyMs = 0;
  chaosState.errorRatePercent = 0;
  chaosState.dependencyDown = false;
}


