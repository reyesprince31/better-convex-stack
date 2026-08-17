"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@better-convex-stack/ui/lib/utils";

export interface PromptInputProps extends HTMLAttributes<HTMLDivElement> {}

export function PromptInput({ className, children, ...props }: PromptInputProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border/50 bg-card/60 hover:bg-card/80 focus-within:bg-background focus-within:border-foreground/30 focus-within:ring-2 focus-within:ring-foreground/5 transition shadow-2xs p-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface PromptInputTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const PromptInputTextarea = forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  ({ className, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    const combinedRef = (ref as any) || innerRef;

    // Auto resize
    useEffect(() => {
      if (combinedRef.current) {
        combinedRef.current.style.height = "auto";
        combinedRef.current.style.height = `${Math.min(combinedRef.current.scrollHeight, 200)}px`;
      }
    }, [props.value, combinedRef]);

    return (
      <textarea
        ref={combinedRef}
        rows={1}
        className={cn(
          "w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden leading-relaxed max-h-48 min-h-9.5 block",
          className,
        )}
        {...props}
      />
    );
  },
);
PromptInputTextarea.displayName = "PromptInputTextarea";

export interface PromptInputFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function PromptInputFooter({ className, children, ...props }: PromptInputFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between pt-2 border-t border-border/30 mt-1",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface PromptInputSubmitProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  status?: "ready" | "streaming" | "submitting" | "error";
}

export function PromptInputSubmit({
  status = "ready",
  disabled,
  className,
  ...props
}: PromptInputSubmitProps) {
  const isSubmitting = status === "submitting" || status === "streaming";

  return (
    <button
      type="submit"
      disabled={disabled || isSubmitting}
      className={cn(
        "flex size-7 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-30 disabled:hover:bg-foreground hover:bg-foreground/90 transition shadow-2xs cursor-pointer disabled:cursor-not-allowed shrink-0",
        className,
      )}
      aria-label="Send message"
      {...props}
    >
      {isSubmitting ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <ArrowUp className="size-3.5 stroke-2" />
      )}
    </button>
  );
}
