"use client";

import { memo } from "react";
import { Code, Compass, Lightbulb, MessageSquare, Sparkles } from "lucide-react";
import { ConversationEmptyState } from "@/components/ai-elements/conversation";

const SAMPLE_PROMPTS = [
  {
    icon: Compass,
    title: "Convex Reactive Queries",
    prompt:
      "Explain how Convex reactive queries work and why you never need polling or manual cache invalidation.",
  },
  {
    icon: Code,
    title: "Durable Agent Steps",
    prompt:
      "How does @convex-dev/agent execute multi-step tools and store conversation threads in the database?",
  },
  {
    icon: Lightbulb,
    title: "UI Architecture Patterns",
    prompt:
      "Give me 3 practical tips for building clean, resilient UI architecture in Next.js and Convex.",
  },
  {
    icon: MessageSquare,
    title: "Context Window & Memory",
    prompt:
      "How does context window trimming, message range search, and vector RAG work in Convex Agent?",
  },
];

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ChatEmptyState = memo(function ChatEmptyState({
  onSelectPrompt,
}: ChatEmptyStateProps) {
  return (
    <ConversationEmptyState
      icon={<Sparkles className="size-5 text-foreground" />}
      title="How can I help you today?"
      description="Ask questions or select a starter prompt below."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl text-left pt-2">
        {SAMPLE_PROMPTS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/20 p-3 text-left transition hover:border-foreground/20 hover:bg-muted/50 group cursor-pointer"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground transition">
                <Icon className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-medium text-foreground truncate">{item.title}</h4>
                <p className="text-[11px] text-muted-foreground/80 line-clamp-2 mt-0.5 leading-relaxed">
                  {item.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </ConversationEmptyState>
  );
});
