"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type UIEvent,
} from "react";
import { PanelLeftOpen, PanelRightOpen, Sparkles } from "lucide-react";
import { cn } from "@better-convex-stack/ui/lib/utils";
import type { UIMessageItem } from "../chat-types";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { ChatEmptyState } from "./empty-state";
import { MessageItem } from "./message-item";

interface ChatWindowProps {
  activeThreadTitle?: string;
  messages: UIMessageItem[];
  optimisticMessages: { role: "user" | "assistant"; text: string; id: string }[];
  isSending: boolean;
  selectedMessageForInspector: UIMessageItem | null;
  onSelectMessageForInspector: (msg: UIMessageItem) => void;
  inputPrompt: string;
  setInputPrompt: (val: string) => void;
  onSendMessage: (e: FormEvent) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isInspectorCollapsed?: boolean;
  onToggleInspector?: () => void;
}

export function ChatWindow({
  activeThreadTitle,
  messages,
  optimisticMessages,
  isSending,
  selectedMessageForInspector,
  onSelectMessageForInspector,
  inputPrompt,
  setInputPrompt,
  onSendMessage,
  isSidebarCollapsed = false,
  onToggleSidebar,
  isInspectorCollapsed = false,
  onToggleInspector,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowScrollButton(!isNearBottom);
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Filter out optimistic messages that Convex has already synced to avoid duplicate bubbles
  const pendingOptimisticMessages =
    optimisticMessages.length === 0
      ? []
      : optimisticMessages.filter((opt) => {
          const alreadyInConvex = messages.some(
            (m) =>
              m.role === "user" &&
              m.text?.trim() === opt.text.trim() &&
              Date.now() - m._creationTime < 15000,
          );
          return !alreadyInConvex;
        });

  const isWaitingForAssistant =
    isSending &&
    (messages.length === 0 ||
      messages[messages.length - 1]?.role === "user" ||
      pendingOptimisticMessages.length > 0);

  // Auto-scroll on new messages or sending state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, pendingOptimisticMessages.length, isSending]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(e);
    }
  };

  const canSend = Boolean(inputPrompt.trim()) && !isSending;
  const isEmpty = messages.length === 0 && pendingOptimisticMessages.length === 0;

  return (
    <div className="flex h-full flex-1 flex-col bg-background relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-6 border-b border-border/40 bg-background">
        <div className="flex items-center gap-2.5 min-w-0">
          {isSidebarCollapsed && onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-background text-foreground shadow-2xs hover:bg-muted transition cursor-pointer shrink-0"
              title="Open sidebar"
            >
              <PanelLeftOpen className="size-3.5" />
            </button>
          )}

          <h2 className="text-xs font-semibold text-foreground truncate">
            {activeThreadTitle || "AI Assistant"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground text-[11px] font-mono shrink-0">
            <Sparkles className="size-3 text-foreground" />
            <span>gpt-4o-mini</span>
          </div>

          {onToggleInspector && (
            <button
              type="button"
              onClick={onToggleInspector}
              className={cn(
                "flex size-7 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground hover:text-foreground shadow-2xs hover:bg-muted transition cursor-pointer shrink-0",
                !isInspectorCollapsed && "text-foreground bg-muted/50",
              )}
              title={isInspectorCollapsed ? "Open inspector" : "Collapse inspector"}
            >
              <PanelRightOpen className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* AI Elements Conversation */}
      <Conversation ref={containerRef} onScroll={handleScroll}>
        <ConversationContent>
          {isEmpty ? (
            <ChatEmptyState onSelectPrompt={setInputPrompt} />
          ) : (
            <>
              {messages.map((msg, idx) => (
                <MessageItem
                  key={msg.key || `msg-${idx}`}
                  message={msg}
                  isSelected={selectedMessageForInspector?.key === msg.key}
                  onSelectForInspector={onSelectMessageForInspector}
                  isStreaming={isSending && idx === messages.length - 1}
                />
              ))}

              {pendingOptimisticMessages.map((msg) => (
                <Message key={msg.id} from="user">
                  <MessageContent className="whitespace-pre-wrap text-sm opacity-70">
                    {msg.text}
                  </MessageContent>
                </Message>
              ))}

              {isWaitingForAssistant ? (
                <Message from="assistant">
                  <MessageContent>
                    <Reasoning isStreaming={true} defaultOpen={true}>
                      <ReasoningTrigger />
                      <ReasoningContent>Thinking and preparing response...</ReasoningContent>
                    </Reasoning>
                  </MessageContent>
                </Message>
              ) : null}

              <div ref={messagesEndRef} />
            </>
          )}
        </ConversationContent>

        <ConversationScrollButton visible={showScrollButton} onClick={scrollToBottom} />
      </Conversation>

      {/* AI Elements Prompt Input */}
      <div className="p-4 bg-background border-t border-border/40">
        <div className="max-w-3xl mx-auto w-full">
          <form onSubmit={onSendMessage}>
            <PromptInput>
              <PromptInputTextarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or enter a prompt..."
                disabled={isSending}
              />

              <PromptInputFooter>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-[10px] text-muted-foreground/60 hidden sm:inline font-mono">
                    Shift + Return for new line
                  </span>
                </div>

                <PromptInputSubmit
                  status={isSending ? "submitting" : "ready"}
                  disabled={!canSend}
                />
              </PromptInputFooter>
            </PromptInput>
          </form>
        </div>
      </div>
    </div>
  );
}
