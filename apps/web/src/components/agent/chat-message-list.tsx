"use client";

import {
  Bot,
  Check,
  Code2,
  Copy,
  Globe,
  Loader2,
  Search,
  Sparkles,
  Terminal,
  User,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { UIMessageItem } from "./agent-types";
import { AutoChainOfThought } from "./chain-of-thought";

type ChatMessageListProps = {
  messages: UIMessageItem[];
  isSending: boolean;
  activeModelName?: string;
  onSelectSuggestion?: (prompt: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

const SUGGESTED_COMMANDS = [
  { icon: Search, label: "/Search", prompt: "Search my workspace for recent changes and tasks" },
  {
    icon: Globe,
    label: "/Web Search",
    prompt: "Search the web for the latest Next.js and Convex guidelines",
  },
  {
    icon: Code2,
    label: "/Generate Code",
    prompt: "Generate a Convex reactive query with rate limiting",
  },
  {
    icon: Terminal,
    label: "/Architecture",
    prompt: "Explain the architecture of this agentic starter repo",
  },
];

function CodeBlockRenderer({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"code">) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const codeString = String(children).replace(/\n$/, "");

  // If inline code without block syntax
  if (!match && !codeString.includes("\n")) {
    return (
      <code
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12px] font-medium text-foreground border border-border/50"
        {...props}
      >
        {children}
      </code>
    );
  }

  const language = match ? match[1] : "code";

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="not-prose my-4 overflow-hidden rounded-lg border border-border/80 bg-muted/40 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/70 px-4 py-2 text-xs text-muted-foreground font-mono">
        <span className="uppercase tracking-wider font-semibold text-[11px]">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 hover:text-foreground text-[11px] transition-colors cursor-pointer"
          aria-label="Copy Code"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 font-mono text-xs sm:text-[13px] text-foreground leading-relaxed">
        <pre className="m-0 p-0 bg-transparent font-mono whitespace-pre">
          <code>{codeString}</code>
        </pre>
      </div>
    </div>
  );
}

function MessageContentRenderer({ text }: { text: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-[13px] leading-relaxed prose-p:my-2 prose-p:leading-relaxed prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-headings:my-3 prose-h1:text-base prose-h2:text-sm prose-h3:text-xs prose-ul:my-2.5 prose-ul:pl-5 prose-ol:my-2.5 prose-ol:pl-5 prose-li:my-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => <>{children}</>,
          code: CodeBlockRenderer,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="not-prose my-3 overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-xs divide-y divide-border m-0">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-muted/50 px-3 py-2 font-semibold text-foreground text-xs">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-t border-border/60 text-xs">{children}</td>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export function ChatMessageList({
  messages,
  isSending,
  activeModelName = "Gemini",
  onSelectSuggestion,
  messagesEndRef,
}: ChatMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center">
          <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-muted/30">
            <Sparkles className="size-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-base font-medium tracking-tight">
            What would you like to build?
          </h2>
          <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
            Ask questions, execute agentic commands, or explore features. Powered by{" "}
            {activeModelName}.
          </p>

          {/* Quick Suggestion Chips */}
          <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2 text-left">
            {SUGGESTED_COMMANDS.map(({ icon: Icon, label, prompt }) => (
              <button
                key={label}
                type="button"
                onClick={() => onSelectSuggestion?.(prompt)}
                className="group flex flex-col justify-between rounded-lg border border-border/80 bg-background/80 p-3 text-xs transition-all hover:border-foreground/30 hover:bg-muted/30 cursor-pointer"
              >
                <div className="flex items-center gap-2 font-medium">
                  <Icon className="size-3.5 text-muted-foreground group-hover:text-foreground" />
                  <span>{label}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">{prompt}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          if (isUser) {
            return (
              <div key={msg.key} className="flex justify-end gap-3">
                <div className="flex max-w-[85%] sm:max-w-[78%] flex-col items-end">
                  <div className="mb-1 text-[10px] font-mono text-muted-foreground">
                    {new Date(msg._creationTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="rounded-2xl rounded-tr-xs bg-foreground px-4 py-2.5 text-xs sm:text-[13px] text-background leading-relaxed whitespace-pre-wrap shadow-sm">
                    {msg.text}
                  </div>
                </div>
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground mt-4">
                  <User className="size-3.5" />
                </div>
              </div>
            );
          }

          const reasoningText =
            msg.reasoning ||
            msg.parts?.find((p) => p.type === "reasoning")?.reasoning ||
            msg.parts?.find((p) => p.type === "reasoning")?.text;

          return (
            <div key={msg.key} className="flex items-start gap-3.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background mt-1">
                <Bot className="size-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {msg.agentName || activeModelName}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(msg._creationTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="text-foreground">
                  {reasoningText && (
                    <AutoChainOfThought
                      durationMs={msg.durationMs}
                      reasoning={reasoningText}
                    />
                  )}

                  {!msg.text || !msg.text.trim() ? (
                    <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-xs text-foreground/90 leading-relaxed">
                      I am currently running in conversational assistant mode without external tool plugins attached. You can ask me questions, write code, or switch models anytime!
                    </div>
                  ) : (
                    <MessageContentRenderer text={msg.text} />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (!messages.length || messages[messages.length - 1]?.role === "user") && (
          <div className="flex items-start gap-3.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background mt-1">
              <Bot className="size-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                <span className="font-semibold text-foreground">{activeModelName}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-primary">
                  <Loader2 className="size-3 animate-spin" />
                  <span>Thinking</span>
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                </div>
                <span className="text-foreground/80 font-medium animate-pulse">
                  Generating response...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
