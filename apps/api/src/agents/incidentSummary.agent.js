import { ChatMistralAI } from "@langchain/mistralai";
import { config } from "../config/config.js";

const SYSTEM_PROMPT = `You are an SRE writing a concise incident summary for a team channel. Given the incident's details, write:
1. A clear 2-3 sentence summary of what happened, suitable for someone with no prior context.
2. A short runbook of 3-5 concrete next-step actions a responder should take right now.

Respond ONLY with valid JSON, no markdown, no preamble, matching exactly this shape:
{
  "summary": "2-3 sentence plain-language summary",
  "runbookSteps": ["step 1", "step 2", "step 3"]
}`;

function buildUserPrompt(incident) {
  return JSON.stringify(
    {
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      triggeredBy: incident.triggeredBy,
      healthSnapshot: incident.healthSnapshot,
      rootCauseAnalysis: incident.rootCauseAnalysis,
      timelineEventCount: incident.timeline.length,
    },
    null,
    2
  );
}

export async function generateSummary(incident) {
  if (!config.mistralApiKey) {
    console.warn("[ai/incident-summary] MISTRAL_API_KEY not set — skipping summary generation");
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
      { role: "user", content: buildUserPrompt(incident) },
    ]);

    const text = typeof response.content === "string" ? response.content : String(response.content);
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(cleaned);
    return {
      summary: parsed.summary || null,
      runbookSteps: Array.isArray(parsed.runbookSteps) ? parsed.runbookSteps : [],
    };
  } catch (err) {
    console.error("[ai/incident-summary] Generation failed:", err.message);
    return null;
  }
}