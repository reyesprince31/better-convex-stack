"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import {
  Check,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import type * as React from "react";

import type { ThreadItem } from "./agent-types";

type ConversationSidebarProps = {
  threads: ThreadItem[];
  activeThreadId: string | null;
  onSelectThread: (thread: ThreadItem) => void;
  onNewThread: () => void;
  onDeleteThread: (threadId: ThreadItem["_id"]) => void;
  onRenameThread?: (threadId: ThreadItem["_id"], newTitle: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onOpenAiSettings?: () => void;
};

function formatThreadDateGroup(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "Previous 7 Days";
  if (diffDays <= 30) return "Previous 30 Days";
  return "Older";
}

export function ConversationSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  onRenameThread,
  isOpen,
  onToggleOpen,
  onOpenAiSettings,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase().trim()),
  );

  // Group threads by date category
  const groupedThreads: Record<string, ThreadItem[]> = {};
  for (const thread of filteredThreads) {
    const group = formatThreadDateGroup(thread.updatedAt);
    if (!groupedThreads[group]) groupedThreads[group] = [];
    groupedThreads[group].push(thread);
  }

  const handleStartRename = (thread: ThreadItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingThreadId(thread._id);
    setEditTitle(thread.title);
  };

  const handleSaveRename = (threadId: ThreadItem["_id"], e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (onRenameThread && editTitle.trim()) {
      onRenameThread(threadId, editTitle.trim());
    }
    setEditingThreadId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingThreadId(null);
  };

  if (!isOpen) {
    return (
      <div className="hidden border-r border-border/60 bg-muted/10 p-2 sm:flex sm:flex-col sm:items-center sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleOpen}
          className="size-8 text-muted-foreground hover:text-foreground"
          aria-label="Open Sidebar"
          title="Open Sidebar"
        >
          <PanelLeftOpen className="size-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={onNewThread}
          className="size-8"
          aria-label="New Conversation"
          title="New Conversation"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border/50 bg-background/95 backdrop-blur">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-3 pb-1.5">
        <div className="flex flex-1 items-center gap-2">
          <Button
            onClick={onNewThread}
            className="h-8 flex-1 justify-start gap-2 rounded-lg bg-foreground px-3 text-xs font-medium text-background hover:opacity-90 transition-opacity"
          >
            <Plus className="size-3.5" />
            <span>New Conversation</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleOpen}
          className="size-8 ml-1 text-muted-foreground hover:text-foreground"
          aria-label="Close Sidebar"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="h-8 w-full rounded-lg border border-border/70 bg-muted/20 pl-8 pr-3 text-xs outline-none focus:border-primary focus:bg-background placeholder:text-muted-foreground transition-all"
          />
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4">
        {Object.keys(groupedThreads).length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            {searchQuery ? "No conversations match your search." : "No conversations yet."}
          </div>
        ) : (
          Object.entries(groupedThreads).map(([group, groupList]) => (
            <div key={group} className="space-y-1">
              <p className="px-2.5 py-1 font-mono text-[10px] tracking-wider text-muted-foreground/80 uppercase">
                {group}
              </p>
              {groupList.map((thread) => {
                const isActive = thread.agentThreadId === activeThreadId;
                const isEditing = editingThreadId === thread._id;

                if (isEditing) {
                  return (
                    <div
                      key={thread._id}
                      className="flex items-center gap-1 rounded-md border border-primary bg-background p-1"
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditTitle(e.target.value)
                        }
                        className="flex-1 bg-transparent px-1.5 py-0.5 text-xs outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={(e) => handleSaveRename(thread._id, e)}
                        className="p-1 text-emerald-600 hover:text-emerald-500"
                        aria-label="Save Title"
                      >
                        <Check className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelRename}
                        className="p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Cancel"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={thread._id}
                    onClick={() => onSelectThread(thread)}
                    className={`group relative flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                      isActive
                        ? "bg-muted/70 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <MessageSquare className="size-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{thread.title}</span>
                    </div>

                    {/* Action buttons (Rename & Delete) */}
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {onRenameThread && (
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(thread, e)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                          title="Rename thread"
                          aria-label="Rename"
                        >
                          <Pencil className="size-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteThread(thread._id);
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive"
                        title="Delete thread"
                        aria-label="Delete"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3">
        <button
          type="button"
          onClick={onOpenAiSettings}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground cursor-pointer"
        >
          <Settings className="size-3.5" />
          <span>AI &amp; Provider Settings (BYOK)</span>
        </button>
      </div>
    </aside>
  );
}
