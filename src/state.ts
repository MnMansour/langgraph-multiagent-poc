import { Annotation } from "@langchain/langgraph";

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type WorkerDestination = "analyzer" | "fixer" | "FINISH";

export const DebuggerState = Annotation.Root({
  rawErrorLog: Annotation<string>(),
  parsedError: Annotation<{
    errorType: string;
    message: string;
    severity: SeverityLevel;
  }>(),
  proposedFix: Annotation<string>(),
  humanApproved: Annotation<boolean>(),
  isVerified: Annotation<boolean>(),
  attempts: Annotation<number>({
    reducer: (current, update) => current + update,
    default: () => 0,
  }),
  nextWorker: Annotation<WorkerDestination>(),
  auditTrail: Annotation<string[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),
});

export type State = typeof DebuggerState.State;