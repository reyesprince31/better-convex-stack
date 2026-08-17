"use client";

import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@better-convex-stack/ui/lib/utils";

export interface ConversationProps extends HTMLAttributes<HTMLDivElement> {}

export const Conversation = forwardRef<HTMLDivElement, ConversationProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-1 flex-col overflow-y-auto min-h-0 w-full scroll-smooth",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Conversation.displayName = "Conversation";

export interface ConversationContentProps extends HTMLAttributes<HTMLDivElement> {}

export function ConversationContent({ className, children, ...props }: ConversationContentProps) {
  return (
    <div
      className={cn(
        "max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 space-y-4 flex-1 flex flex-col justify-start",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ConversationEmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export function ConversationEmptyState({
  icon,
  title,
  description,
  children,
  className,
  ...props
}: ConversationEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center text-center p-6 space-y-3 my-auto",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="flex size-10 items-center justify-center rounded-2xl bg-muted text-foreground/80 shadow-2xs">
          {icon}
        </div>
      ) : null}
      <div className="max-w-sm space-y-1">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
        {description ? (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        ) : null}
      </div>
      {children ? <div className="w-full max-w-md pt-2">{children}</div> : null}
    </div>
  );
}

export interface ConversationScrollButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  visible?: boolean;
}

export function ConversationScrollButton({
  visible = false,
  className,
  ...props
}: ConversationScrollButtonProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      className={cn(
        "absolute bottom-4 right-4 z-10 flex size-8 items-center justify-center rounded-full bg-background border border-border/50 shadow-md text-muted-foreground hover:text-foreground transition cursor-pointer",
        className,
      )}
      {...props}
    >
      <ArrowDown className="size-4" />
    </button>
  );
}
