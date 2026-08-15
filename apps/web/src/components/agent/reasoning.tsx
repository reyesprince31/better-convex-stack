"use client";

import { Brain, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ReasoningProps = {
  children: string;
  durationMs?: number;
  isStreaming?: boolean;
  defaultOpen?: boolean;
  className?: string;
};

export function Reasoning({
  children,
  durationMs,
  isStreaming = false,
  defaultOpen = false,
  className = "",
}: ReasoningProps) {
  const [isOpen, setIsOpen] = useState(isStreaming || defaultOpen);

  if (!children && !isStreaming) return null;

  const durationText = durationMs
    ? durationMs >= 1000
      ? `Thought for ${(durationMs / 1000).toFixed(1)}s`
      : `Thought for ${durationMs}ms`
    : isStreaming
      ? "Thinking..."
      : "Reasoning process";

  return (
    <div className={`my-2 overflow-hidden rounded-lg border border-border/70 bg-muted/20 ${className}`}>
      {/* Trigger Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3.5 py-2 text-left text-xs transition-colors hover:bg-muted/30 cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          {isStreaming ? (
            <Sparkles className="size-3.5 text-primary animate-pulse" />
          ) : (
            <Brain className="size-3.5 text-muted-foreground" />
          )}
          <span className="font-medium text-foreground/80">{durationText}</span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span>{isOpen ? "Hide" : "Show"}</span>
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Content Accordion */}
      {isOpen && (
        <div className="border-t border-border/50 bg-background/50 px-4 py-3 text-xs text-muted-foreground">
          <div className="prose prose-sm dark:prose-invert max-w-none text-[12px] leading-relaxed italic prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
