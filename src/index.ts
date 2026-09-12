import { debuggerGraph } from "./graph.js";

async function runPoC() {
  console.log("=================================================");
  console.log("   OPENAI + HUMAN-IN-THE-LOOP (HITL) DEBUGGER   ");
  console.log("=================================================");

  const threadConfig = {
    configurable: {
      thread_id: "prod-incident-4041",
    },
  };

  const initialInput = {
    rawErrorLog: "2026-09-12 01:20:00 [CRITICAL] PostgresConnectionPoolError: Connection refused at 10.0.0.15:5432. Active connections 100/100.",
  };

  console.log("\n[Phase 1]: Invoking Multi-Agent Graph...");
  await debuggerGraph.invoke(initialInput, threadConfig);

  let snapshot = await debuggerGraph.getState(threadConfig);
  console.log("\n-------------------------------------------------");
  console.log("             SYSTEM INTERRUPTED (HITL)            ");
  console.log("-------------------------------------------------");
  console.log("Next Pending Node: ", snapshot.next);
  console.log("Parsed Error Type:  ", snapshot.values.parsedError?.errorType);

  console.log("\n[Phase 2]: Human Operator approving execution...");
  await debuggerGraph.updateState(
    threadConfig,
    { humanApproved: true },
    "supervisor"
  );

  console.log("\n[Phase 3]: Resuming Graph Execution...");
  const finalState = await debuggerGraph.invoke(null, threadConfig);

  console.log("\n=================================================");
  console.log("             FINAL SUMMARY OUTPUT                ");
  console.log("=================================================");
  console.log("Verified Status:", finalState.isVerified);
  console.log("\nProposed Fix:\n", finalState.proposedFix);
}

runPoC().catch(console.error);