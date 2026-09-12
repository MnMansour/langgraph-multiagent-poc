import { ChatOpenAI } from "@langchain/openai";
import { State } from "../state.js";

export const fixerWorkerNode = async (state: State): Promise<Partial<State>> => {
  const currentAttempt = state.attempts + 1;
  console.log(`  └─ [Worker: Fixer] Generating patch via OpenAI GPT-4o (Attempt #${currentAttempt})...`);

  if (state.humanApproved === false) {
    console.log("  └─ [Worker: Fixer] Fix execution aborted by Human Operator.");
    return {
      isVerified: false,
      auditTrail: [`[Fixer]: Remediation canceled by human operator.`],
    };
  }

  const llm = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.2,
  });

  const prompt = `You are a Senior Systems Engineer. Generate a practical remediation code snippet or config change for this error:
  
Type: ${state.parsedError?.errorType}
Summary: ${state.parsedError?.message}
Severity: ${state.parsedError?.severity}

Provide only a direct, concise fix.`;

  const response = await llm.invoke(prompt);
  const fixText = response.content.toString().trim();

  return {
    proposedFix: fixText,
    isVerified: true,
    attempts: 1,
    auditTrail: [
      `[Fixer LLM]: Generated patch -> "${fixText.slice(0, 80)}..."`,
    ],
  };
};