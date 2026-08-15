"use client";

import {
  Brain,
  ChevronDown,
  CircleDot,
  CheckCircle2,
  Clock,
  Globe,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { createContext, useContext, useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ============================================================================
// CONTEXT
// ============================================================================

type ChainOfThoughtContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  contentId: string;
};

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(null);

function useChainOfThought() {
  const context = useContext(ChainOfThoughtContext);
  if (!context) {
    throw new Error("ChainOfThought components must be used within <ChainOfThought>");
  }
  return context;
}

// ============================================================================
// 1. ROOT COMPONENT: ChainOfThought
// ============================================================================

export interface ChainOfThoughtProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function ChainOfThought({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  className = "",
  ...props
}: ChainOfThoughtProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const contentId = useId();

  const handleToggle = (nextOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  return (
    <ChainOfThoughtContext.Provider
      value={{
        isOpen,
        setIsOpen: handleToggle,
        contentId,
      }}
    >
      <div
        data-state={isOpen ? "open" : "closed"}
        className={`w-full my-2.5 overflow-hidden rounded-xl border border-border/80 bg-muted/15 transition-all ${className}`}
        {...props}
      >
        {children}
      </div>
    </ChainOfThoughtContext.Provider>
  );
}

// ============================================================================
// 2. HEADER: ChainOfThoughtHeader
// ============================================================================

export interface ChainOfThoughtHeaderProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: LucideIcon;
  durationMs?: number;
}

export function ChainOfThoughtHeader({
  children,
  icon: Icon = Brain,
  durationMs,
  className = "",
  ...props
}: ChainOfThoughtHeaderProps) {
  const { isOpen, setIsOpen, contentId } = useChainOfThought();

  const durationText = durationMs
    ? durationMs >= 1000
      ? `Thought for ${(durationMs / 1000).toFixed(1)}s`
      : `Thought for ${durationMs}ms`
    : null;

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-controls={contentId}
      className={`flex w-full items-center justify-between gap-2.5 px-3.5 py-2.5 text-left text-xs font-medium transition-colors hover:bg-muted/30 cursor-pointer ${className}`}
      {...props}
    >
      <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
        <Icon className="size-3.5 text-primary shrink-0" />
        <span className="font-semibold text-foreground/90">
          {children || durationText || "Chain of Thought"}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="font-sans text-[10px] tracking-wide uppercase font-semibold text-muted-foreground/80">
          {isOpen ? "Hide" : "Show"}
        </span>
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>
    </button>
  );
}

// ============================================================================
// 3. CONTENT: ChainOfThoughtContent
// ============================================================================

export interface ChainOfThoughtContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ChainOfThoughtContent({
  children,
  className = "",
  ...props
}: ChainOfThoughtContentProps) {
  const { isOpen, contentId } = useChainOfThought();

  if (!isOpen) return null;

  return (
    <div
      id={contentId}
      data-state={isOpen ? "open" : "closed"}
      className={`border-t border-border/60 bg-background/50 px-4 py-3.5 text-xs text-muted-foreground transition-all animate-in fade-in-0 slide-in-from-top-1 ${className}`}
      {...props}
    >
      <div className="relative space-y-3 pl-1">{children}</div>
    </div>
  );
}

// ============================================================================
// 4. STEP: ChainOfThoughtStep
// ============================================================================

export type StepStatus = "complete" | "active" | "pending" | "error";

export interface ChainOfThoughtStepProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  label: React.ReactNode;
  description?: React.ReactNode;
  status?: StepStatus;
  isLast?: boolean;
}

export function ChainOfThoughtStep({
  icon: CustomIcon,
  label,
  description,
  status = "complete",
  isLast = false,
  children,
  className = "",
  ...props
}: ChainOfThoughtStepProps) {
  const Icon =
    CustomIcon ||
    (status === "complete"
      ? CheckCircle2
      : status === "active"
        ? CircleDot
        : status === "pending"
          ? Clock
          : CircleDot);

  return (
    <div className={`relative flex gap-3 text-xs ${className}`} {...props}>
      {/* Vertical connector line */}
      {!isLast && (
        <div
          aria-hidden="true"
          className="absolute top-5 bottom-0 left-[7px] -mx-px w-[1.5px] bg-border/80"
        />
      )}

      {/* Step Icon Indicator */}
      <div className="relative z-10 mt-0.5 shrink-0">
        <Icon
          className={`size-4 ${
            status === "active"
              ? "text-primary animate-pulse"
              : status === "complete"
                ? "text-emerald-500 dark:text-emerald-400"
                : status === "error"
                  ? "text-destructive"
                  : "text-muted-foreground/60"
          }`}
        />
      </div>

      {/* Step Content */}
      <div className="flex-1 min-w-0 space-y-1.5 pb-2">
        <div className="font-medium text-foreground/90 leading-tight">{label}</div>

        {description && (
          <div className="text-[11px] text-muted-foreground/80 leading-relaxed">
            {typeof description === "string" ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
            ) : (
              description
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

// ============================================================================
// 5. SEARCH RESULTS & BADGES
// ============================================================================

export function ChainOfThoughtSearchResults({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-2 flex flex-wrap items-center gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface ChainOfThoughtSearchResultProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  url?: string;
  title?: string;
}

export function ChainOfThoughtSearchResult({
  url,
  title,
  children,
  className = "",
  ...props
}: ChainOfThoughtSearchResultProps) {
  const displayLabel = title || children || url || "Source";

  return (
    <a
      href={url || "#"}
      target={url ? "_blank" : undefined}
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 font-mono text-[10px] text-foreground/80 transition-colors hover:border-foreground/30 hover:bg-muted/80 ${className}`}
      {...props}
    >
      <Globe className="size-2.5 text-muted-foreground" />
      <span className="truncate max-w-[200px]">{displayLabel}</span>
    </a>
  );
}

// ============================================================================
// 6. IMAGE PREVIEW
// ============================================================================

export interface ChainOfThoughtImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt?: string;
  caption?: string;
}

export function ChainOfThoughtImage({
  src,
  alt = "AI Output Image",
  caption,
  className = "",
  ...props
}: ChainOfThoughtImageProps) {
  return (
    <div className={`mt-2 overflow-hidden rounded-lg border border-border bg-muted/30 p-2 ${className}`} {...props}>
      <img
        src={src}
        alt={alt}
        className="max-h-[220px] w-full rounded-md object-contain border border-border/50 bg-background"
      />
      {caption && (
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground italic">
          {caption}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// 7. AUTO REASONING PARSER (Parses raw CoT text into structured Steps)
// ============================================================================

export interface AutoChainOfThoughtProps {
  reasoning: string;
  durationMs?: number;
  defaultOpen?: boolean;
  className?: string;
}

export function AutoChainOfThought({
  reasoning,
  durationMs,
  defaultOpen = false,
  className = "",
}: AutoChainOfThoughtProps) {
  if (!reasoning || !reasoning.trim()) return null;

  // Split lines to detect step indicators (e.g. "1. Step...", "- Step...", or sections)
  const lines = reasoning.split(/\n+/).filter((l) => l.trim().length > 0);

  const steps: { label: string; details?: string; icon?: LucideIcon }[] = [];

  let currentStep: { label: string; details: string[]; icon?: LucideIcon } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const isNumbered = /^(?:\d+[.)]|\*|-|#+)\s*(.+)/i.exec(trimmed);

    if (isNumbered) {
      if (currentStep) {
        steps.push({
          label: currentStep.label,
          details: currentStep.details.length > 0 ? currentStep.details.join("\n") : undefined,
          icon: currentStep.icon,
        });
      }

      let stepLabel = isNumbered[1] || trimmed;
      let icon: LucideIcon = Brain;

      if (/search|query|lookup|google|find/i.test(stepLabel)) {
        icon = Search;
      }

      currentStep = {
        label: stepLabel,
        details: [],
        icon,
      };
    } else if (currentStep) {
      currentStep.details.push(trimmed);
    } else {
      currentStep = {
        label: trimmed,
        details: [],
        icon: Brain,
      };
    }
  }

  if (currentStep) {
    steps.push({
      label: currentStep.label,
      details: currentStep.details.length > 0 ? currentStep.details.join("\n") : undefined,
      icon: currentStep.icon,
    });
  }

  // Fallback if parsing produced only 1 chunk or unnumbered text
  if (steps.length <= 1) {
    return (
      <ChainOfThought defaultOpen={defaultOpen} className={className}>
        <ChainOfThoughtHeader durationMs={durationMs} />
        <ChainOfThoughtContent>
          <div className="prose prose-sm dark:prose-invert max-w-none text-[12px] leading-relaxed italic">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{reasoning}</ReactMarkdown>
          </div>
        </ChainOfThoughtContent>
      </ChainOfThought>
    );
  }

  return (
    <ChainOfThought defaultOpen={defaultOpen} className={className}>
      <ChainOfThoughtHeader durationMs={durationMs}>
        {`Chain of Thought (${steps.length} steps)`}
      </ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        {steps.map((step, idx) => (
          <ChainOfThoughtStep
            key={idx}
            icon={step.icon}
            label={step.label}
            description={step.details}
            status="complete"
            isLast={idx === steps.length - 1}
          />
        ))}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
