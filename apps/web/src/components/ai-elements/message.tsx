"use client";

import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@better-convex-stack/ui/lib/utils";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";

export interface MessageProps extends HTMLAttributes<HTMLDivElement> {
  from: "user" | "assistant" | "system" | string;
}

export function Message({ from, className, children, ...props }: MessageProps) {
  const isUser = from === "user";

  return (
    <div
      data-from={from}
      className={cn(
        "group relative flex w-full flex-col text-sm",
        isUser ? "items-end" : "items-start",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface MessageContentProps extends HTMLAttributes<HTMLDivElement> {}

export function MessageContent({ className, children, ...props }: MessageContentProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl text-sm leading-relaxed",
        "group-data-[from=user]:max-w-[85%] group-data-[from=user]:bg-muted group-data-[from=user]:text-foreground group-data-[from=user]:px-3.5 group-data-[from=user]:py-2 group-data-[from=user]:rounded-tr-xs",
        "group-data-[from=assistant]:w-full group-data-[from=assistant]:bg-transparent group-data-[from=assistant]:text-foreground group-data-[from=assistant]:p-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface MessageResponseProps {
  children?: string;
  className?: string;
}

export function MessageResponse({ children, className }: MessageResponseProps) {
  if (!children) return null;
  return <MarkdownRenderer content={children} className={className} />;
}

export interface MessageActionsProps extends HTMLAttributes<HTMLDivElement> {}

export function MessageActions({ className, children, ...props }: MessageActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 mt-1 text-muted-foreground opacity-80 hover:opacity-100 transition-opacity",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface MessageActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export function MessageAction({ label, className, children, ...props }: MessageActionProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        "flex size-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer text-xs",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
