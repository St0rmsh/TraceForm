import { ChatAnthropic } from "@langchain/anthropic";
import { config } from "../../config/config.js";
import { ChatCohere } from "@langchain/cohere";

const SYNTHESIZE_SYSTEM_PROMPT = `You are distilling an SRE's raw investigation notes into a final structured root-cause finding. Respond ONLY with valid JSON, no markdown, no preamble, matching exactly this shape:
{
  "rootCause": "one or two sentence root cause statement",
  "confidence": "low" | "medium" | "high",
  "contributingFactors": ["short factor 1", "short factor 2"]
}`;

// export async function synthesize(state) {
//   if (!config.anthropicApiKey || !state.rawAnalysis) {
//     return {
//       ...state,
//       finalAnalysis: {
//         rootCause: null,
//         confidence: null,
//         contributingFactors: [],
//       },
//     };
//   }

//   const model = new ChatAnthropic({
//     apiKey: config.anthropicApiKey,
//     model: "claude-3-5-haiku-latest",
//     temperature: 0.1,
//   });

//   const response = await model.invoke([
//     { role: "system", content: SYNTHESIZE_SYSTEM_PROMPT },
//     { role: "user", content: state.rawAnalysis },
//   ]);

//   let finalAnalysis;
//   try {
//     const text = typeof response.content === "string" ? response.content : String(response.content);
//     const cleaned = text.replace(/```json|```/g, "").trim();
//     finalAnalysis = JSON.parse(cleaned);
//   } catch (err) {
//     console.error("[agents/rootCause] Failed to parse synthesize output:", err.message);
//     finalAnalysis = { rootCause: null, confidence: null, contributingFactors: [] };
//   }

//   return { ...state, finalAnalysis };
// }


export async function synthesize(state) {
  if (!config.cohereApiKey || !state.rawAnalysis) {
    return {
      ...state,
      finalAnalysis: {
        rootCause: null,
        confidence: null,
        contributingFactors: [],
      },
    };
  }

  const model = new ChatCohere({
    apiKey: config.cohereApiKey,
    model: "command-a-03-2025",
    temperature: 0.1,
  });

  const response = await model.invoke([
    {
      role: "system",
      content: SYNTHESIZE_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: state.rawAnalysis,
    },
  ]);

  let finalAnalysis;

  try {
    const text =
      typeof response.content === "string"
        ? response.content
        : String(response.content);

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    finalAnalysis = JSON.parse(cleaned);
  } catch (err) {
    console.error(
      "[agents/rootCause] Failed to parse synthesize output:",
      err.message
    );

    finalAnalysis = {
      rootCause: null,
      confidence: null,
      contributingFactors: [],
    };
  }

  return {
    ...state,
    finalAnalysis,
  };
}