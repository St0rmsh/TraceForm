import { ChatAnthropic } from "@langchain/anthropic";
import { config } from "../../config/config.js";
import { ChatCohere } from "@langchain/cohere";


const ANALYZE_SYSTEM_PROMPT = `
You are an SRE investigating a production incident.

You will be given the incident's health snapshot, a breakdown of recent
traffic by route, and results from any recent load tests on the same service.

Reason carefully about what could be causing this incident. Consider whether
the pattern matches a pure load/capacity issue, a specific broken route, a
regression correlated with a recent load test's findings, or something else.

Write your raw analysis as a few paragraphs of reasoning.

Do not produce a final structured answer yet — just think through the evidence.
`;


// export async function analyze(state) {
//   if (!config.anthropicApiKey) {
//     console.warn("[agents/rootCause] ANTHROPIC_API_KEY not set — skipping analyze step");
//     return { ...state, rawAnalysis: null };
//   }

//   const model = new ChatAnthropic({
//     apiKey: config.anthropicApiKey,
//     model: "claude-3-5-haiku-latest",
//     temperature: 0.3,
//   });

//   const response = await model.invoke([
//     { role: "system", content: ANALYZE_SYSTEM_PROMPT },
//     { role: "user", content: JSON.stringify(state.context, null, 2) },
//   ]);

//   return { ...state, rawAnalysis: response.content };
// }


export async function analyze(state) {
  if (!config.cohereApiKey) {
    console.warn(
      "[agents/rootCause] COHERE_API_KEY not set — skipping analyze step"
    );

    return {
      ...state,
      rawAnalysis: null,
    };
  }

  const model = new ChatCohere({
    apiKey: config.cohereApiKey,
    model: "command-a-03-2025",
    temperature: 0.3,
  });

  const response = await model.invoke([
    {
      role: "system",
      content: ANALYZE_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: JSON.stringify(state.context, null, 2),
    },
  ]);

  return {
    ...state,
    rawAnalysis: response.content,
  };
}