"use client";

import { ArrowUp, Mic, Paperclip, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type * as React from "react";

import type { ModelItem } from "./agent-types";
import { ModelSelector } from "./model-selector";

type ChatPromptInputProps = {
  onSendMessage: (prompt: string) => void;
  isSending: boolean;
  isConfigured: boolean;
  activeModel: string;
  availableModels: ModelItem[];
  provider?: "google" | "openai";
  onModelChange: (newModel: string) => void;
  onOpenSettings: () => void;
};

export function ChatPromptInput({
  onSendMessage,
  isSending,
  isConfigured,
  activeModel,
  availableModels,
  provider = "google",
  onModelChange,
  onOpenSettings,
}: ChatPromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-adjust textarea height up to 160px
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSending) return;

    if (!isConfigured) {
      onOpenSettings();
      return;
    }

    onSendMessage(prompt.trim());
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-transparent px-4 pb-4 pt-1 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="relative mx-auto flex w-full max-w-3xl flex-col rounded-xl border border-border/80 bg-muted/25 shadow-xs transition-all focus-within:border-foreground/40 focus-within:bg-background focus-within:ring-1 focus-within:ring-ring/20 backdrop-blur-md"
      >
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            isConfigured
              ? "Ask AI or type / for commands... (Press Enter to send, Shift+Enter for new line)"
              : "Please configure your Gemini API Key in Settings to start..."
          }
          disabled={isSending}
          className="max-h-40 min-h-[48px] w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-xs sm:text-[13px] text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Left: Model Selector & Attachments */}
          <div className="flex items-center gap-2">
            {/* Dynamic Model Selector (AI Elements styled) */}
            {isConfigured && availableModels.length > 0 ? (
              <ModelSelector
                activeModel={activeModel}
                availableModels={availableModels}
                provider={provider}
                onModelChange={onModelChange}
                disabled={isSending}
              />
            ) : (
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-mono text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <Sparkles className="size-3" />
                <span>Configure BYOK Key</span>
              </button>
            )}

            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              title="Add attachment (future feature)"
              aria-label="Attachment"
            >
              <Paperclip className="size-3.5" />
            </button>
          </div>

          {/* Right: Voice & Send */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              title="Voice Input (mock)"
              aria-label="Voice input"
            >
              <Mic className="size-3.5" />
            </button>

            <button
              type="submit"
              disabled={isSending || !prompt.trim()}
              className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer"
              aria-label="Send message"
            >
              <ArrowUp className="size-3.5" />
            </button>
          </div>
        </div>
      </form>

      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        AI responses are generated dynamically via Google Gemini. Verify important details.
      </p>
    </div>
  );
}
