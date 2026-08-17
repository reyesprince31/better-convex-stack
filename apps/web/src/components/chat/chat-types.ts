export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
}

export interface ToolCallInfo {
  toolCallId: string;
  toolName: string;
  args?: Record<string, any>;
  result?: any;
  output?: any;
}

export interface UIMessageItem {
  key: string;
  id?: string;
  role: "user" | "assistant" | "system" | "tool";
  text?: string;
  reasoning?: string;
  _creationTime: number;
  status?: string;
  order?: number;
  stepOrder?: number;
  agentName?: string;
  userId?: string;
  threadId?: string;
  tool?: boolean;
  usage?: TokenUsage;
  warnings?: any[];
  finishReason?: string;
  model?: string;
  parts?: any[];
  toolCalls?: ToolCallInfo[];
}

export interface ThreadListItem {
  _id: string;
  threadId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  snippet?: string;
}
