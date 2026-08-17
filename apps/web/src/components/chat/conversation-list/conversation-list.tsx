"use client";

import { useState, type MouseEvent } from "react";
import { Loader2, PanelLeftClose, Plus, Search } from "lucide-react";
import { cn } from "@better-convex-stack/ui/lib/utils";
import type { ThreadListItem } from "../chat-types";
import { ThreadItem } from "./thread-item";

interface ConversationListProps {
  threads: ThreadListItem[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onCreateThread: () => void;
  onDeleteThread: (id: string) => void;
  isLoading: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ConversationList({
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
  onDeleteThread,
  isLoading,
  isCollapsed = false,
  onToggleCollapse,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredThreads = !searchQuery.trim()
    ? threads
    : threads.filter((t) => (t.title || "").toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDelete = (threadId: string, e: MouseEvent) => {
    e.stopPropagation();
    onDeleteThread(threadId);
  };

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col bg-muted/20 border-r border-border/40 select-none transition-all duration-200 ease-in-out overflow-hidden",
        isCollapsed ? "w-0 border-r-0 opacity-0 pointer-events-none" : "w-64 opacity-100",
      )}
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between px-3.5 border-b border-border/40">
        <div className="flex items-center gap-2">
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex size-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="size-3.5" />
            </button>
          )}
          <span className="text-xs font-semibold text-foreground">Conversations</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            {threads.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onCreateThread}
          className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-background text-foreground shadow-2xs hover:bg-muted transition cursor-pointer"
          title="New Chat"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search threads..."
            className="w-full rounded-lg bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-foreground/30 focus:outline-hidden transition"
          />
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-thin">
        {isLoading && threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-xs gap-2">
            <Loader2 className="size-4 animate-spin text-muted-foreground/60" />
            <span>Loading threads...</span>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            {searchQuery ? "No matching conversations" : "No conversations yet"}
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <ThreadItem
              key={thread.threadId}
              thread={thread}
              isActive={activeThreadId === thread.threadId}
              onSelect={onSelectThread}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </aside>
  );
}
