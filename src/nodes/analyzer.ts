import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { State } from "../state.js";

const AnalysisSchema = z.object({
  errorType: z.string().describe("Categorical error type, e.g., DatabaseError, OutOfMemory, SyntaxError"),
  message: z.string().describe("Clear summary of the error cause"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).describe("Severity level"),
});

export const analyzerWorkerNode = async (state: State): Promise<Partial<State>> => {
  console.log("  └─ [Worker: Analyzer] Querying OpenAI GPT-4o for log analysis...");

  const llm = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0,
  }).withStructuredOutput(AnalysisSchema);

  const prompt = `Analyze this application error log and classify it:\n\n${state.rawErrorLog}`;
  const response = await llm.invoke(prompt);

  return {
    parsedError: {
      errorType: response.errorType,
      message: response.message,
      severity: response.severity,
    },
    auditTrail: [
      `[Analyzer LLM]: Categorized as [${response.errorType}] with severity [${response.severity}].`,
    ],
  };
};