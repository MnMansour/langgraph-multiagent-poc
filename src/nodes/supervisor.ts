import { State, WorkerDestination } from "../state.js";

export const supervisorNode = async (state: State): Promise<Partial<State>> => {
  console.log("\n--> [Supervisor Node] Inspecting state...");

  if (!state.parsedError) {
    console.log("    Decision -> Delegate to [Analyzer]");
    return { nextWorker: "analyzer" };
  }

  if (!state.isVerified && state.attempts < 3) {
    console.log("    Decision -> Delegate to [Fixer] (Requires Human Approval Gate)");
    return { nextWorker: "fixer" };
  }

  console.log("    Decision -> Objective complete. Terminating workflow.");
  return { nextWorker: "FINISH" };
};

export const routeDecision = (state: State): WorkerDestination => {
  return state.nextWorker ?? "FINISH";
};