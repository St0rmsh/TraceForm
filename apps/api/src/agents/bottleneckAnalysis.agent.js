import { ChatMistralAI } from "@langchain/mistralai";
import { config } from "../config/config.js";

const SYSTEM_PROMPT = `You are a senior SRE reviewing load test results for a colleague. Given the test configuration, any chaos conditions that were injected, and the resulting metrics, write a concise 2-4 sentence plain-language diagnosis of what likely happened and why. Be specific about whether the results point to raw load capacity issues, the injected chaos conditions, or a combination. Avoid generic advice — reason from the actual numbers given. Do not use markdown formatting.`;

function buildUserPrompt(run) {
  return JSON.stringify(
    {
      route: run.config.route,
      method: run.config.method,
      targetRps: run.config.endRps,
      concurrency: run.config.concurrency,
      durationSeconds: run.config.durationSeconds,
      chaosInjected: {
        extraLatencyMs: run.chaos.extraLatencyMs,
        errorRatePercent: run.chaos.errorRatePercent,
        dependencyDown: run.chaos.dependencyDown,
      },
      results: run.results,
    },
    null,
    2
  );
}

export async function analyzeBottleneck(run) {
  if (!config.mistralApiKey) {
    console.warn("[ai/bottleneck] MISTRAL_API_KEY not set — skipping AI analysis");
    return null;
  }

  try {
    const model = new ChatMistralAI({
      apiKey: config.mistralApiKey,
      model: "mistral-small-latest",
      temperature: 0.3,
    });

    const response = await model.invoke([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(run) },
    ]);

    return response.content;
  } catch (err) {
    console.error("[ai/bottleneck] Analysis failed:", err.message);
    return null;
  }
}