import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { ChatAnthropic } from "@langchain/anthropic";
import RequestLog from "@traceform/shared/models/RequestLog.model.js";
import LoadTestRun from "@traceform/shared/models/LoadTestRun.model.js";
import { config } from "../config/config.js";
import { ChatCohere } from "@langchain/cohere";

const GraphState = Annotation.Root({
  incident: Annotation(),
  project: Annotation(),
  context: Annotation(),
  hypothesis: Annotation(),
  critique: Annotation(),
  confidence: Annotation(),
});

async function gatherContext(state) {
  const { incident, project } = state;

  const recentLogs = await RequestLog.find({ project: project._id })
    .sort({ timestamp: -1 })
    .limit(100);

  const recentLoadTest = await LoadTestRun.findOne({
    project: project._id,
    status: "completed",
  }).sort({ completedAt: -1 });

  const errorLogs = recentLogs.filter((l) => l.statusCode >= 500);
  const routeBreakdown = {};
  for (const log of recentLogs) {
    const key = `${log.method} ${log.path}`;
    routeBreakdown[key] = (routeBreakdown[key] || 0) + 1;
  }

  const context = {
    incidentTitle: incident.title,
    healthSnapshot: incident.healthSnapshot,
    anomalyThresholds: project.anomalyThresholds,
    recentRequestCount: recentLogs.length,
    recentErrorCount: errorLogs.length,
    routeBreakdown,
    recentLoadTest: recentLoadTest
      ? {
          name: recentLoadTest.name,
          chaosInjected: recentLoadTest.chaos,
          results: recentLoadTest.results,
          completedAt: recentLoadTest.completedAt,
        }
      : null,
  };

  return { context };
}

async function analyze(state, model) {
  const prompt = `You are an SRE analyst investigating a production incident. Given this evidence, propose the most likely root cause in 2-3 sentences. Be specific and reason from the data — cite which pieces of evidence support your hypothesis. If a recent load test with chaos injection correlates with this incident, call that out explicitly.

Evidence:
${JSON.stringify(state.context, null, 2)}`;

  const response = await model.invoke([{ role: "user", content: prompt }]);

  return { hypothesis: response.content };
}

async function critique(state, model) {
  const prompt = `You are a senior SRE reviewing a colleague's root-cause hypothesis before it goes into an incident report. Given the same evidence and their hypothesis, do two things: (1) write 1-2 sentences either confirming the hypothesis or noting what it misses/overstates, (2) on a new line, output exactly one of: CONFIDENCE: low, CONFIDENCE: medium, or CONFIDENCE: high.

Evidence:
${JSON.stringify(state.context, null, 2)}

Colleague's hypothesis:
${state.hypothesis}`;

  const response = await model.invoke([{ role: "user", content: prompt }]);
  const text = response.content;

  const confidenceMatch = text.match(/CONFIDENCE:\s*(low|medium|high)/i);
  const confidence = confidenceMatch ? confidenceMatch[1].toLowerCase() : "low";
  const critiqueText = text.replace(/CONFIDENCE:\s*(low|medium|high)/i, "").trim();

  return { critique: critiqueText, confidence };
}

// export async function runRootCauseChain(incident, project) {
//   if (!config.anthropicApiKey) {
//     console.warn("[ai/root-cause] ANTHROPIC_API_KEY not set — skipping root-cause analysis");
//     return null;
//   }

//   const model = new ChatAnthropic({
//     apiKey: config.anthropicApiKey,
//     model: "claude-3-5-haiku-latest",
//     temperature: 0.2,
//     maxTokens: 400,
//   });

//   const graph = new StateGraph(GraphState)
//     .addNode("gatherContext", gatherContext)
//     .addNode("analyze", (state) => analyze(state, model))
//     .addNode("critique", (state) => critique(state, model))
//     .addEdge(START, "gatherContext")
//     .addEdge("gatherContext", "analyze")
//     .addEdge("analyze", "critique")
//     .addEdge("critique", END)
//     .compile();

//   try {
//     const result = await graph.invoke({ incident, project });

//     return {
//       hypothesis: result.hypothesis,
//       critique: result.critique,
//       confidence: result.confidence,
//       evidence: [
//         `${result.context.recentErrorCount} errors out of ${result.context.recentRequestCount} recent requests`,
//         result.context.recentLoadTest
//           ? `Correlated with recent load test "${result.context.recentLoadTest.name}"`
//           : "No recent load test correlation found",
//       ],
//     };
//   } catch (err) {
//     console.error("[ai/root-cause] Chain failed:", err.message);
//     return null;
//   }
// }


export async function runRootCauseChain(incident, project) {
  if (!config.cohereApiKey) {
    console.warn(
      "[ai/root-cause] COHERE_API_KEY not set — skipping root-cause analysis"
    );

    return null;
  }

  const model = new ChatCohere({
    apiKey: config.cohereApiKey,
    model: "command-a-03-2025",
    temperature: 0.2,
    maxTokens: 400,
  });

  const graph = new StateGraph(GraphState)
    .addNode("gatherContext", gatherContext)
    .addNode("analyze", (state) => analyze(state, model))
    .addNode("critique", (state) => critique(state, model))
    .addEdge(START, "gatherContext")
    .addEdge("gatherContext", "analyze")
    .addEdge("analyze", "critique")
    .addEdge("critique", END)
    .compile();

  try {
    const result = await graph.invoke({
      incident,
      project,
    });

    return {
      hypothesis: result.hypothesis,
      critique: result.critique,
      confidence: result.confidence,
      evidence: [
        `${result.context.recentErrorCount} errors out of ${result.context.recentRequestCount} recent requests`,
        result.context.recentLoadTest
          ? `Correlated with recent load test "${result.context.recentLoadTest.name}"`
          : "No recent load test correlation found",
      ],
    };
  } catch (err) {
    console.error("[ai/root-cause] Chain failed:", err.message);
    return null;
  }
}