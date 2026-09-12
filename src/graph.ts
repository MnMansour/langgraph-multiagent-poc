import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { DebuggerState } from "./state.js";
import { supervisorNode, routeDecision } from "./nodes/supervisor.js";
import { analyzerWorkerNode } from "./nodes/analyzer.js";
import { fixerWorkerNode } from "./nodes/fixer.js";

const checkpointer = new MemorySaver();

const workflow = new StateGraph(DebuggerState)
  .addNode("supervisor", supervisorNode)
  .addNode("analyzer", analyzerWorkerNode)
  .addNode("fixer", fixerWorkerNode)

  .addEdge(START, "supervisor")

  .addConditionalEdges("supervisor", routeDecision, {
    analyzer: "analyzer",
    fixer: "fixer",
    FINISH: END,
  })

  .addEdge("analyzer", "supervisor")
  .addEdge("fixer", "supervisor");

export const debuggerGraph = workflow.compile({
  checkpointer,
  interruptBefore: ["fixer"],
});