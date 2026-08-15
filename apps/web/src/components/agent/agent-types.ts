import type { Id } from "@better-convex-stack/backend/convex/_generated/dataModel";

export type ThreadItem = {
  _id: Id<"threads">;
  agentThreadId: string;
  title: string;
  model?: string;
  createdAt: number;
  updatedAt: number;
};

export type LogEntry = {
  id: string;
  timestamp: string;
  source: "client" | "server";
  message: string;
  type?: "info" | "success" | "error" | "warn";
};

export type ModelItem = {
  id: string;
  displayName: string;
  description?: string;
};

export type UIMessageItem = {
  key: string;
  role: string;
  text?: string;
  reasoning?: string;
  durationMs?: number;
  agentName?: string;
  _creationTime: number;
  parts?: Array<{
    type: string;
    text?: string;
    reasoning?: string;
  }>;
};

