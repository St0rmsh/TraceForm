function hasActiveChaos(chaos) {
  if (!chaos) return false;
  return chaos.extraLatencyMs > 0 || chaos.errorRatePercent > 0 || chaos.dependencyDown === true;
}

export async function applyChaos(targetBaseUrl, chaos) {
  if (!hasActiveChaos(chaos)) return { applied: false };

  try {
    const response = await fetch(`${targetBaseUrl}/chaos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        extraLatencyMs: chaos.extraLatencyMs,
        errorRatePercent: chaos.errorRatePercent,
        dependencyDown: chaos.dependencyDown,
      }),
    });

    if (!response.ok) {
      console.warn(
        `[chaos] Target service returned ${response.status} for /chaos — it may not support chaos injection. Continuing without chaos applied.`
      );
      return { applied: false };
    }

    console.log(`[chaos] Applied chaos conditions to ${targetBaseUrl}`);
    return { applied: true };
  } catch (err) {
    console.warn(`[chaos] Could not apply chaos to ${targetBaseUrl}:`, err.message);
    return { applied: false };
  }
}

export async function resetChaos(targetBaseUrl) {
  try {
    const response = await fetch(`${targetBaseUrl}/chaos/reset`, { method: "POST" });

    if (!response.ok) {
      console.warn(`[chaos] Reset returned ${response.status} for ${targetBaseUrl}`);
      return;
    }

    console.log(`[chaos] Reset chaos conditions on ${targetBaseUrl}`);
  } catch (err) {
    console.warn(`[chaos] Could not reset chaos on ${targetBaseUrl}:`, err.message);
  }
}