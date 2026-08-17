"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { Check, Code2, Copy, GripVertical, Info, PanelRightClose } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@better-convex-stack/ui/lib/utils";
import type { UIMessageItem } from "../chat-types";
import { buildMessageDetailsJson } from "../chat-utils";

const MIN_WIDTH = 260;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 320;

interface InspectorPanelProps {
  selectedMessage: UIMessageItem | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function InspectorPanel({
  selectedMessage,
  isCollapsed = false,
  onToggleCollapse,
}: InspectorPanelProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const startXRef = useRef(0);
  const startWidthRef = useRef(DEFAULT_WIDTH);

  const jsonString = selectedMessage ? buildMessageDetailsJson(selectedMessage) : "";

  const handleCopy = () => {
    if (!jsonString) return;
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success("JSON copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Start pointer drag
  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
    },
    [width],
  );

  // Global pointer move & up listeners while dragging
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: globalThis.PointerEvent) => {
      // Moving mouse left (smaller clientX) increases width of a right panel
      const deltaX = startXRef.current - e.clientX;
      const nextWidth = Math.min(Math.max(startWidthRef.current + deltaX, MIN_WIDTH), MAX_WIDTH);
      setWidth(nextWidth);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging]);

  return (
    <aside
      style={{ width: isCollapsed ? 0 : `${width}px` }}
      className={cn(
        "relative flex h-full shrink-0 flex-col bg-muted/20 border-l border-border/40 select-none transition-all duration-200 ease-in-out overflow-hidden",
        isDragging && "transition-none",
        isCollapsed ? "w-0 border-l-0 opacity-0 pointer-events-none" : "opacity-100",
      )}
    >
      {/* Draggable Resize Handle on Left Edge (only when expanded) */}
      {!isCollapsed && (
        <div
          onPointerDown={handlePointerDown}
          onDoubleClick={() => setWidth(DEFAULT_WIDTH)}
          className={cn(
            "absolute -left-1.5 top-0 bottom-0 w-3 cursor-col-resize z-20 group flex items-center justify-center",
            "hover:bg-primary/10 transition-colors",
            isDragging && "bg-primary/20",
          )}
          title="Drag to resize column (Double-click to reset)"
        >
          <div
            className={cn(
              "h-8 w-1 rounded-full bg-border/80 group-hover:bg-primary transition-colors flex items-center justify-center",
              isDragging && "bg-primary h-12",
            )}
          >
            <GripVertical className="size-2 text-muted-foreground group-hover:text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between px-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Code2 className="size-4 text-foreground" />
          <span className="text-xs font-semibold text-foreground">Return Value</span>
        </div>

        <div className="flex items-center gap-1.5">
          {selectedMessage && jsonString ? (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy JSON"
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition cursor-pointer"
            >
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              <span className="text-[11px]">Copy</span>
            </button>
          ) : null}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex size-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="Collapse inspector"
            >
              <PanelRightClose className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3.5">
        {!selectedMessage ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground text-xs gap-2">
            <Info className="size-5 text-muted-foreground/50" />
            <p className="max-w-50 leading-relaxed text-muted-foreground/80">
              Click on any assistant message or code icon to inspect its JSON return object.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-mono">
                Order #{selectedMessage.stepOrder ?? selectedMessage.order ?? 0}
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                {selectedMessage.status || "success"}
              </span>
            </div>

            <pre className="p-3 rounded-xl bg-background border border-border/40 font-mono text-[11px] text-foreground leading-relaxed overflow-x-auto select-text whitespace-pre-wrap word-break">
              {jsonString}
            </pre>
          </div>
        )}
      </div>
    </aside>
  );
}
