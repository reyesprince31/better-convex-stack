"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@better-convex-stack/ui/lib/utils";
import { CodeBlock } from "@/components/ai-elements/code-block";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function MarkdownCode({
  inline,
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"code"> & { inline?: boolean }) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  if (inline || (!match && !codeString.includes("\n"))) {
    return (
      <code
        className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground border border-border/50"
        {...props}
      >
        {children}
      </code>
    );
  }

  return <CodeBlock code={codeString} language={language || "code"} showLineNumbers={false} />;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("text-xs leading-relaxed space-y-2", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-foreground mt-3 mb-1.5 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-semibold text-foreground mt-3 mb-1 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-foreground mt-2.5 mb-1 tracking-tight">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-medium text-foreground mt-2 mb-0.5">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed text-foreground/90 my-1 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-4 space-y-0.5 my-1.5 text-foreground/90">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 space-y-0.5 my-1.5 text-foreground/90">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/50 pl-3 my-1.5 italic text-muted-foreground bg-muted/20 py-1 rounded-r-md">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => <hr className="my-2.5 border-border/40" />,
          table: ({ children }) => (
            <div className="my-2.5 overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-left text-xs divide-y divide-border/50">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/40 font-semibold text-foreground">{children}</thead>
          ),
          tbody: ({ children }) => <tbody className="divide-y divide-border/40">{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => <th className="p-2 font-medium">{children}</th>,
          td: ({ children }) => <td className="p-2 text-foreground/90">{children}</td>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-2 hover:opacity-80 transition"
            >
              {children}
            </a>
          ),
          code: MarkdownCode as any,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
