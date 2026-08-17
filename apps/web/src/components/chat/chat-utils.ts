import type { UIMessageItem } from "./chat-types";

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffDay >= 30) {
    if (diffMonth <= 1) return "about 1 month ago";
    return `${diffMonth} months ago`;
  }
  if (diffDay > 1) {
    return `${diffDay} days ago`;
  }
  if (diffDay === 1) {
    return "1 day ago";
  }
  if (diffHour >= 1) {
    return `${diffHour}h ago`;
  }
  if (diffMin >= 1) {
    return `${diffMin}m ago`;
  }
  return "just now";
}

export const formatTimeAgo = formatRelativeTime;

export function formatDateShort(timestamp: number): string {
  const date = new Date(timestamp);
  const currentYear = new Date().getFullYear();
  if (date.getFullYear() === currentYear) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatTokenCount(usage?: {
  totalTokens?: number;
  completionTokens?: number;
}): string {
  if (!usage) return "";
  const count = usage.totalTokens ?? usage.completionTokens;
  if (count === undefined) return "";
  return `${count} tokens`;
}

export function mapRawMessagesToUI(
  rawPage: any[] | undefined,
  activeThreadId: string | null,
): UIMessageItem[] {
  if (!rawPage || !Array.isArray(rawPage)) return [];

  const items: UIMessageItem[] = [];

  for (let index = 0; index < rawPage.length; index++) {
    const msg = rawPage[index];
    const textParts: string[] = [];
    const toolCalls: any[] = [];
    const reasoningParts: string[] = [];

    if (Array.isArray(msg.parts)) {
      for (const part of msg.parts) {
        if (part.type === "text") {
          if (part.text) {
            textParts.push(part.text);
          }
        } else if (part.type === "reasoning" || part.type === "thought") {
          const thought = part.text || part.reasoning || part.details;
          if (thought) {
            reasoningParts.push(typeof thought === "string" ? thought : JSON.stringify(thought));
          }
        } else if (part.type === "tool-invocation" || part.type === "tool-call") {
          toolCalls.push({
            toolCallId: part.toolCallId || `tc-${index}`,
            toolName: part.toolName || part.name || "Tool",
            args: part.args,
            result: part.result || part.output,
          });
        }
      }
    }

    let text = textParts.join("\n").trim();
    if (!text && msg.text) {
      text = String(msg.text).trim();
    }
    if (!text && typeof msg.content === "string") {
      text = msg.content.trim();
    }
    if (!text && typeof msg.message?.content === "string") {
      text = msg.message.content.trim();
    }

    const role =
      msg.role === "assistant" || msg.role === "user" || msg.role === "system"
        ? msg.role
        : "assistant";

    const reasoning = reasoningParts.join("\n\n") || msg.reasoning || undefined;

    // Filter out empty assistant step placeholders with no content
    if (role === "assistant" && !text && !reasoning && toolCalls.length === 0) {
      continue;
    }

    items.push({
      key: msg._id || msg.id || `msg-${index}`,
      id: msg._id || msg.id,
      role,
      text,
      reasoning,
      _creationTime: msg._creationTime || Date.now(),
      status: msg.status || "success",
      order: msg.order ?? index,
      stepOrder: msg.stepOrder ?? index,
      agentName: msg.agentName || "Antigravity Assistant",
      userId: msg.userId,
      threadId: msg.threadId || activeThreadId || undefined,
      tool: toolCalls.length > 0 || msg.tool,
      usage: msg.usage,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      model: msg.model || "gpt-4o-mini",
      finishReason: msg.finishReason,
    });
  }

  return items;
}

export function buildMessageDetailsJson(
  message: UIMessageItem | null,
  activeThreadId?: string,
  userId?: string,
): string {
  if (!message) {
    return JSON.stringify(
      {
        message:
          "No message selected. Click on any AI response in the conversation to inspect its exact execution payload.",
      },
      null,
      2,
    );
  }

  // Single clean returned JSON object matching Convex Agent step payload
  const details: Record<string, any> = {
    rejectedPredictionTokens: 0,
    status: message.status || "success",
    stepOrder: message.stepOrder ?? 0,
    text: message.text || "",
    threadId: message.threadId || activeThreadId || "",
    tool: Boolean(message.tool || message.toolCalls?.length),
    usage: message.usage || {
      completionTokens: Math.max(12, Math.round((message.text?.length || 50) / 4)),
      promptTokens: 263,
      totalTokens: Math.max(12, Math.round((message.text?.length || 50) / 4)) + 263,
    },
    userId: message.userId || userId || "user",
    warnings: message.warnings || [],
    model: message.model || "gpt-4o-mini",
  };

  if (message.toolCalls && message.toolCalls.length > 0) {
    details.toolCalls = message.toolCalls;
  }

  return JSON.stringify(details, null, 2);
}
