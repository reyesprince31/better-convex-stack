"use client";

import { memo, type MouseEvent } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import type { ThreadListItem } from "../chat-types";
import { formatTimeAgo } from "../chat-utils";

interface ThreadItemProps {
  thread: ThreadListItem;
  isActive: boolean;
  onSelect: (threadId: string) => void;
  onDelete: (threadId: string, e: MouseEvent) => void;
}

export const ThreadItem = memo(function ThreadItem({
  thread,
  isActive,
  onSelect,
  onDelete,
}: ThreadItemProps) {
  return (
    <div
      onClick={() => onSelect(thread.threadId)}
      className={`group relative flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all ${
        isActive
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <MessageSquare
          className={`size-3.5 shrink-0 transition-colors ${
            isActive ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs leading-normal">{thread.title || "New Chat"}</p>
          <p className="text-[10px] text-muted-foreground/60 leading-none mt-0.5">
            {formatTimeAgo(thread.updatedAt)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => onDelete(thread.threadId, e)}
        title="Delete conversation"
        className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity p-1 rounded-md hover:bg-background/80"
      >
        <Trash2 className="size-3" />
      </button>
    </div>
  );
});
