import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { gatherContext } from "./gatherContext.node.js";
import { analyze } from "./analyze.node.js";
import { synthesize } from "./synthesize.node.js";

const RootCauseState = Annotation.Root({
  incident: Annotation(),
  project: Annotation(),
  context: Annotation(),
  rawAnalysis: Annotation(),
  finalAnalysis: Annotation(),
});

const graph = new StateGraph(RootCauseState)
  .addNode("gatherContext", gatherContext)
  .addNode("analyze", analyze)
  .addNode("synthesize", synthesize)
  .addEdge(START, "gatherContext")
  .addEdge("gatherContext", "analyze")
  .addEdge("analyze", "synthesize")
  .addEdge("synthesize", END);

const compiledGraph = graph.compile();

export async function runRootCauseChain(incident, project) {
  const result = await compiledGraph.invoke({ incident, project });
  return result.finalAnalysis;
}