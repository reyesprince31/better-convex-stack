"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Wrench } from "lucide-react";
import type { ToolCallInfo } from "../chat-types";

interface ToolCallCardProps {
  tool: ToolCallInfo;
}

export function ToolCallCard({ tool }: ToolCallCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border/50 bg-muted/30 text-xs overflow-hidden transition">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-2.5 hover:bg-muted/60 transition cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <Wrench className="size-3.5 text-muted-foreground" />
          <span className="font-mono text-xs font-medium text-foreground">{tool.toolName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
          <span>Tool Execution</span>
          {isExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        </div>
      </button>

      {isExpanded ? (
        <div className="border-t border-border/40 p-3 bg-background/50 font-mono text-[11px] space-y-2">
          {tool.args ? (
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                Arguments
              </span>
              <pre className="mt-1 p-2 rounded-lg bg-muted/60 text-foreground overflow-x-auto">
                {JSON.stringify(tool.args, null, 2)}
              </pre>
            </div>
          ) : null}
          {tool.result || tool.output ? (
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                Result
              </span>
              <pre className="mt-1 p-2 rounded-lg bg-muted/60 text-foreground overflow-x-auto">
                {JSON.stringify(tool.result || tool.output, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
