# 🤖 Stateful Multi-Agent Error Debugger (LangGraph + TypeScript)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph_TS-0.2.0-orange.svg)](https://js.langchain.com/docs/langgraph)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-green.svg)](https://platform.openai.com/)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

An enterprise-grade, stateful multi-agent log analyzer and automated code remediator built using **LangGraph for TypeScript**, **OpenAI GPT-4o**, and strict **Human-in-the-Loop (HITL)** controls.

This architecture moves beyond simple linear prompts into a **Cyclic Multi-Agent System**, utilizing state reducers, thread-based checkpoint memory, structured Zod schemas, and explicit execution approval gates.

---

## 🏗️ Architectural Topology

The system operates using a **Supervisor / Multi-Worker Pattern**. The Supervisor evaluates execution state and dynamically dispatches tasks to specialized sub-agents or holds for human approval.

```text
                               ┌─────────────────────────┐
                               │    Supervisor Node      │
                               │   (Manager / Router)    │
                               └────────────┬────────────┘
                                            │
           ┌────────────────────────────────┼────────────────────────────────┐
           │ Delegate                       │ Delegate                       │ Terminate
           ▼                                ▼                                ▼
┌─────────────────────────┐      ┌─────────────────────┐                  ┌─────┐
│   Log Analyzer Worker   │      │ Human Approval Gate │                  │ END │
│  (ChatOpenAI + Zod Schema)     │  (interruptBefore)  │                  │     │
└──────────┬──────────────┘      └──────────┬──────────┘                  └─────┘
           │                                │ Approved
           │                                ▼
           │                     ┌─────────────────────┐
           │                     │  Fixer Worker Node  │
           │                     │  (LLM Code Patch)   │
           │                     └──────────┬──────────┘
           │                                │
           └────────────────────────────────┴──► (Loop back to Supervisor)
```

---

## Key Features

*   **Strict State Annotations & Reducers**: State channels manage partial updates using atomic append reducers (`(current, update) => current.concat(update)`).
*   **Structured LLM Output**: Log analysis is parsed into strictly typed JSON structures via Zod validation schemas.
*   **Human-in-the-Loop (HITL)**: System halts execution using `interruptBefore: ["fixer"]`, allowing humans to inspect, modify, or approve actions via `updateState`.
*   **Thread Persistence (`MemorySaver`)**: Supports multi-session memory, checkpoint state snapshots, and state resumption across isolated thread IDs.
*   **Cyclic Self-Correction**: Implements ReAct feedback loops to retry remediation actions until verified or bounded by attempt limits.

## 🛠️ Tech Stack & Prerequisites

*   **Runtime Environment**: Node.js v18.0.0+ (ES Modules enabled)
*   **Language Engine**: Modern TypeScript (ES2022 / NodeNext module resolution)
*   **Core Orchestrator**: `@langchain/langgraph`
*   **LLM Provider**: `@langchain/openai` (GPT-4o)
*   **Type Validation**: `zod`

---

## 🚀 Quickstart Guide

### 1. Clone & Install Dependencies

```bash
git clone [https://github.com/YOUR_USERNAME/langgraph-multiagent-poc.git](https://github.com/YOUR_USERNAME/langgraph-multiagent-poc.git)
cd langgraph-multiagent-poc
npm install
```

### 2. Configure Environment Variables

Copy the sample environment file and insert your API key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
OPENAI_API_KEY=sk-proj-your_actual_openai_api_key
```

### 3. Run System Proof-of-Concept

Execute direct TS execution via `tsx`:

```bash
npm start
```

---

## 📂 Repository Structure

```text
langgraph-multiagent-poc/
├── .env.example              # Environment variables template
├── package.json              # Package definition and npm scripts
├── tsconfig.json             # Strict TypeScript compiler rules
├── README.md                 # Technical documentation
└── src/
    ├── state.ts              # Centralized Graph State annotation & types
    ├── graph.ts              # StateGraph compilation & checkpointer assembly
    ├── index.ts              # Main execution runner & HITL lifecycle demo
    └── nodes/
        ├── supervisor.ts     # Router node & delegation logic
        ├── analyzer.ts       # Structured OpenAI log analysis worker
        └── fixer.ts          # LLM remediation code generator worker
```

---

## 🔄 Execution Lifecycle Summary

When executing `npm start`, the graph completes three distinct operational phases:

1. **Phase 1: Automated Ingestion & Analysis**  
   The system ingests raw log traces. The **Supervisor** delegates to the **Analyzer**, which queries GPT-4o using a Zod schema to categorize the error severity and root cause.
2. **Phase 2: Human-in-the-Loop Interruption**  
   The execution hits the `interruptBefore: ["fixer"]` barrier. Execution pauses, preserving thread state in `MemorySaver`. State status changes to `pending`.
3. **Phase 3: State Injection & Resumption**  
   A human operator inspects the parsed state and updates state flags using `debuggerGraph.updateState(config, { humanApproved: true })`. Execution resumes by invoking `debuggerGraph.invoke(null, config)` to produce the final patch.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.