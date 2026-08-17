"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Brain, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@better-convex-stack/ui/lib/utils";

interface ReasoningContextValue {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration?: number;
}

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

export function useReasoning() {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error("useReasoning must be used within a <Reasoning /> component");
  }
  return context;
}

export interface ReasoningProps extends HTMLAttributes<HTMLDivElement> {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
}

export function Reasoning({
  isStreaming = false,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  duration: controlledDuration,
  className,
  children,
  ...props
}: ReasoningProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [internalDuration, setInternalDuration] = useState<number | undefined>(controlledDuration);
  const startTimeRef = useRef<number | null>(null);
  const prevStreamingRef = useRef<boolean>(isStreaming);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  // Auto-open when streaming starts, auto-close when streaming finishes
  useEffect(() => {
    const wasStreaming = prevStreamingRef.current;
    prevStreamingRef.current = isStreaming;

    if (isStreaming && !wasStreaming) {
      startTimeRef.current = Date.now();
      setIsOpen(true);
    } else if (!isStreaming && wasStreaming) {
      if (startTimeRef.current) {
        const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        setInternalDuration(elapsed);
        startTimeRef.current = null;
      }
      setIsOpen(false);
    }
  }, [isStreaming, setIsOpen]);

  const effectiveDuration = controlledDuration ?? internalDuration;

  const contextValue = useMemo(
    () => ({
      isStreaming,
      isOpen,
      setIsOpen,
      duration: effectiveDuration,
    }),
    [isStreaming, isOpen, setIsOpen, effectiveDuration],
  );

  return (
    <ReasoningContext.Provider value={contextValue}>
      <div className={cn("w-full my-2 text-xs", className)} {...props}>
        {children}
      </div>
    </ReasoningContext.Provider>
  );
}

export interface ReasoningTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
}

export function ReasoningTrigger({
  getThinkingMessage,
  className,
  children,
  ...props
}: ReasoningTriggerProps) {
  const { isStreaming, isOpen, setIsOpen, duration } = useReasoning();

  const renderMessage = () => {
    if (getThinkingMessage) {
      return getThinkingMessage(isStreaming, duration);
    }
    if (isStreaming) {
      return "Thinking...";
    }
    if (duration !== undefined) {
      return `Thought for ${duration}s`;
    }
    return "Thought process";
  };

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer select-none",
        isStreaming && "text-primary hover:text-primary animate-pulse",
        className,
      )}
      aria-expanded={isOpen}
      {...props}
    >
      {isStreaming ? (
        <Loader2 className="size-3.5 animate-spin text-primary shrink-0" />
      ) : (
        <Brain className="size-3.5 text-muted-foreground shrink-0" />
      )}

      <span className="font-mono font-medium text-[11.5px] truncate">
        {children || renderMessage()}
      </span>

      {isOpen ? (
        <ChevronDown className="size-3 shrink-0 ml-auto opacity-70" />
      ) : (
        <ChevronRight className="size-3 shrink-0 ml-auto opacity-70" />
      )}
    </button>
  );
}

export interface ReasoningContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function ReasoningContent({ className, children, ...props }: ReasoningContentProps) {
  const { isOpen } = useReasoning();

  if (!isOpen || !children) return null;

  return (
    <div
      className={cn(
        "mt-1.5 ml-2 pl-3 border-l-2 border-border/60 text-xs text-muted-foreground leading-relaxed font-mono whitespace-pre-wrap select-text bg-muted/20 rounded-r-lg p-2.5 space-y-1",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
