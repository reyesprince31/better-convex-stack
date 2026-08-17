"use client";

import { memo, useState, type MouseEvent } from "react";
import { Check, Code2, Copy } from "lucide-react";
import { toast } from "sonner";
import type { UIMessageItem } from "../chat-types";
import { formatTokenCount } from "../chat-utils";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { ToolCallCard } from "./tool-call-card";

interface MessageItemProps {
  message: UIMessageItem;
  isSelected: boolean;
  onSelectForInspector: (msg: UIMessageItem) => void;
  isStreaming?: boolean;
}

export const MessageItem = memo(function MessageItem({
  message,
  isSelected,
  onSelectForInspector,
  isStreaming = false,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const tokenBadge = formatTokenCount(message.usage);

  const handleCopy = (e: MouseEvent) => {
    e.stopPropagation();
    if (!message.text) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    toast.success("Response copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInspect = (e: MouseEvent) => {
    e.stopPropagation();
    onSelectForInspector(message);
  };

  if (isUser) {
    return (
      <Message from="user">
        <MessageContent className="whitespace-pre-wrap text-sm">{message.text}</MessageContent>
      </Message>
    );
  }

  const hasReasoning = Boolean(message.reasoning);
  const hasToolCalls = Boolean(message.toolCalls && message.toolCalls.length > 0);
  const hasText = Boolean(message.text && message.text.trim().length > 0);

  // Do not render empty floating cards if there is no text, reasoning, or tool invocations
  if (!hasText && !hasReasoning && !hasToolCalls) {
    return null;
  }

  return (
    <Message
      from="assistant"
      onClick={() => onSelectForInspector(message)}
      className={`rounded-2xl p-3 -mx-3 transition-colors cursor-pointer ${
        isSelected ? "bg-muted/40 ring-1 ring-border/60" : "hover:bg-muted/20"
      }`}
    >
      <MessageContent>
        {/* AI Elements Reasoning Block */}
        {hasReasoning ? (
          <Reasoning isStreaming={isStreaming} defaultOpen={false}>
            <ReasoningTrigger />
            <ReasoningContent>{message.reasoning}</ReasoningContent>
          </Reasoning>
        ) : null}

        {/* Tool Invocations */}
        {hasToolCalls ? (
          <div className="my-2 space-y-2">
            {message.toolCalls!.map((tool, idx) => (
              <ToolCallCard key={`${message.key}-${tool.toolCallId || idx}`} tool={tool} />
            ))}
          </div>
        ) : null}

        {/* Text Markdown Response */}
        {hasText ? <MessageResponse>{message.text || ""}</MessageResponse> : null}
      </MessageContent>

      {/* Action Toolbar */}
      {hasText ? (
        <MessageActions>
          <MessageAction label="Copy response" onClick={handleCopy}>
            {copied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </MessageAction>
          <MessageAction label="Inspect JSON return value" onClick={handleInspect}>
            <Code2 className="size-3.5" />
          </MessageAction>
          {tokenBadge ? (
            <span className="text-[10px] text-muted-foreground/60 font-mono ml-2">
              {tokenBadge}
            </span>
          ) : null}
        </MessageActions>
      ) : null}
    </Message>
  );
});
