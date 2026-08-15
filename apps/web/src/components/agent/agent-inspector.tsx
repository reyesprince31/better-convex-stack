"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import {
  Activity,
  Cpu,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Terminal,
  Wrench,
} from "lucide-react";
import { useState } from "react";

import type { LogEntry } from "./agent-types";

type AgentInspectorProps = {
  logs: LogEntry[];
  activeModel: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  lastExecutionMs?: number;
};

export function AgentInspector({
  logs,
  activeModel,
  isOpen,
  onToggleOpen,
  lastExecutionMs,
}: AgentInspectorProps) {
  const [activeTab, setActiveTab] = useState<"trace" | "tools" | "model">("trace");

  if (!isOpen) {
    return (
      <div className="hidden border-l border-border/70 bg-muted/10 p-2 lg:flex lg:flex-col lg:items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleOpen}
          className="size-8 text-muted-foreground hover:text-foreground"
          aria-label="Open Inspector"
          title="Open Inspector"
        >
          <PanelRightOpen className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-border/70 bg-background/95 backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 p-3">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />
          <span className="font-mono text-xs font-semibold tracking-wider uppercase">
            Agent Inspector
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleOpen}
          className="size-7 text-muted-foreground hover:text-foreground"
          aria-label="Close Inspector"
        >
          <PanelRightClose className="size-4" />
        </Button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-border/60 bg-muted/20 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("trace")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2 font-medium transition-colors ${
            activeTab === "trace"
              ? "border-b-2 border-primary text-foreground bg-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Terminal className="size-3.5" />
          <span>Trace</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tools")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2 font-medium transition-colors ${
            activeTab === "tools"
              ? "border-b-2 border-primary text-foreground bg-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wrench className="size-3.5" />
          <span>Tools</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("model")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2 font-medium transition-colors ${
            activeTab === "model"
              ? "border-b-2 border-primary text-foreground bg-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Cpu className="size-3.5" />
          <span>Model</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 text-xs">
        {/* Trace Tab */}
        {activeTab === "trace" && (
          <div className="space-y-3 font-mono text-[11px]">
            {lastExecutionMs !== undefined && (
              <div className="border border-border/70 bg-muted/20 p-2 flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Last Generation:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {lastExecutionMs}ms
                </span>
              </div>
            )}

            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Events and execution traces will stream here live...
                </div>
              ) : (
                logs.map((log) => {
                  let badge = "bg-muted text-muted-foreground";
                  if (log.type === "success")
                    badge = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                  if (log.type === "error") badge = "bg-red-500/10 text-red-600 dark:text-red-400";
                  if (log.type === "warn")
                    badge = "bg-amber-500/10 text-amber-600 dark:text-amber-400";

                  return (
                    <div
                      key={log.id}
                      className="border-b border-border/40 pb-2 last:border-b-0 space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                        <span className={`px-1 py-0.2 rounded uppercase font-semibold ${badge}`}>
                          {log.source}
                        </span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="break-words text-foreground/90 font-sans text-[11px] leading-snug">
                        {log.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tools & MCP Tab */}
        {activeTab === "tools" && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-foreground">Registered Agent Tools</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tools available for the agent to call automatically.
              </p>
            </div>

            <div className="space-y-2">
              {[
                { name: "web_search", desc: "Performs web queries via Google search APIs" },
                { name: "code_executor", desc: "Executes TypeScript/JS snippets in sandbox" },
                { name: "convex_db_reader", desc: "Queries live Convex tables reactively" },
                { name: "mcp_connector", desc: "Model Context Protocol bridge for local tools" },
              ].map((tool) => (
                <div key={tool.name} className="border border-border/80 bg-muted/20 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-foreground">
                      {tool.name}
                    </span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] text-primary">
                      Ready
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model Specs Tab */}
        {activeTab === "model" && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-foreground">Model Configuration</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Runtime parameters and capabilities.
              </p>
            </div>

            <div className="border border-border/80 bg-muted/20 p-3 space-y-2.5 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Provider:</span>
                <span className="text-foreground">Google AI</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Model:</span>
                <span className="text-foreground">{activeModel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Framework:</span>
                <span className="text-foreground">@convex-dev/agent</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Streaming:</span>
                <span className="text-emerald-600 dark:text-emerald-400">Supported</span>
              </div>
            </div>

            <div className="border border-border/60 p-3 bg-background text-[11px] text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Sparkles className="size-3 text-primary" />
                <span>Dynamic BYOK Architecture</span>
              </div>
              <p>
                Models are fetched dynamically from your Google Gemini key permissions, ensuring
                zero hardcoding and support for future model updates.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
