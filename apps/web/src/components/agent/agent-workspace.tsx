"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { Key, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { api } from "@better-convex-stack/backend/convex/_generated/api";

import type { ModelItem, ThreadItem, UIMessageItem } from "./agent-types";
import { AiSettingsDialog } from "./ai-settings-dialog";
import { ChatMessageList } from "./chat-message-list";
import { ChatPromptInput } from "./chat-prompt-input";
import { ConversationSidebar } from "./conversation-sidebar";

export function AgentWorkspace() {
  // Convex Queries & Mutations
  const threadsData = useQuery(api.chat.listUserThreads);
  const aiSettings = useQuery(api.chat.getAiSettings);
  const createThreadMutation = useMutation(api.chat.createUserThread);
  const deleteThreadMutation = useMutation(api.chat.deleteUserThread);
  const renameThreadMutation = useMutation(api.chat.renameUserThread);
  const updateModelMutation = useMutation(api.chat.updateActiveModel);
  const sendMessageAction = useAction(api.chat.sendMessage);

  // Local State
  const [activeThread, setActiveThread] = useState<ThreadItem | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [overrideModel, setOverrideModel] = useState<string | null>(null);

  useEffect(() => {
    if (aiSettings?.model) {
      setOverrideModel(aiSettings.model);
    }
  }, [aiSettings?.model]);

  const activeModel = overrideModel || aiSettings?.model || "gemini-2.5-flash";

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threads: ThreadItem[] = threadsData || [];

  // Initialize or synchronize active thread
  useEffect(() => {
    if (threads.length > 0 && !activeThread) {
      setActiveThread(threads[0]);
    }
  }, [threads, activeThread]);

  // Query messages for currently active thread
  const messagesData = useQuery(
    api.chat.listMessages,
    activeThread?.agentThreadId
      ? {
          threadId: activeThread.agentThreadId,
          paginationOpts: { numItems: 50, cursor: null },
        }
      : "skip",
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData]);

  // Create new conversation
  const handleNewThread = async () => {
    try {
      const result = await createThreadMutation({
        title: "New Conversation",
        model: aiSettings?.model,
      });

      const newThreadItem: ThreadItem = {
        _id: result.threadId,
        agentThreadId: result.agentThreadId,
        title: "New Conversation",
        model: aiSettings?.model,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setActiveThread(newThreadItem);
      toast.success("New conversation started");
    } catch (error) {
      const err = error instanceof Error ? error.message : "Failed to create conversation";
      toast.error(err);
    }
  };

  // Delete conversation
  const handleDeleteThread = async (threadId: string) => {
    try {
      const target = threads.find((t) => t.agentThreadId === threadId);
      if (!target) return;

      await deleteThreadMutation({ threadId: target._id });

      if (activeThread?.agentThreadId === threadId) {
        const remaining = threads.filter((t) => t.agentThreadId !== threadId);
        setActiveThread(remaining.length > 0 ? remaining[0] : null);
      }

      toast.success("Conversation deleted");
    } catch (error) {
      const err = error instanceof Error ? error.message : "Failed to delete conversation";
      toast.error(err);
    }
  };

  // Rename conversation
  const handleRenameThread = async (threadId: string, newTitle: string) => {
    try {
      const target = threads.find((t) => t.agentThreadId === threadId);
      if (!target) return;

      await renameThreadMutation({ threadId: target._id, title: newTitle });

      if (activeThread?.agentThreadId === threadId) {
        setActiveThread({ ...activeThread, title: newTitle });
      }

      toast.success("Conversation renamed");
    } catch (error) {
      const err = error instanceof Error ? error.message : "Failed to rename conversation";
      toast.error(err);
    }
  };

  // Update active model
  const handleModelChange = async (newModel: string) => {
    setOverrideModel(newModel);
    try {
      await updateModelMutation({ model: newModel, provider: aiSettings?.provider });
      toast.success(`Model updated to ${newModel}`);
    } catch (error) {
      const err = error instanceof Error ? error.message : "Failed to update model";
      toast.error(err);
      if (aiSettings?.model) setOverrideModel(aiSettings.model);
    }
  };

  // Send message
  const handleSendMessage = async (promptText: string) => {
    if (!promptText.trim() || isSending) return;

    if (!aiSettings?.isConfigured) {
      setIsSettingsOpen(true);
      toast.error("Please configure your API Key first.");
      return;
    }

    setIsSending(true);

    try {
      let currentAgentThreadId = activeThread?.agentThreadId;

      // Auto-create thread if none is active
      if (!currentAgentThreadId) {
        const title =
          promptText.length > 35 ? `${promptText.slice(0, 32)}...` : promptText;
        const newThread = await createThreadMutation({
          title,
          model: activeModel,
        });

        currentAgentThreadId = newThread.agentThreadId;
        setActiveThread({
          _id: newThread.threadId,
          agentThreadId: newThread.agentThreadId,
          title,
          model: activeModel,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      await sendMessageAction({
        threadId: currentAgentThreadId,
        prompt: promptText,
        modelOverride: activeModel,
        providerOverride: aiSettings?.provider,
      });
    } catch (error) {
      const err = error instanceof Error ? error.message : "Failed to send message";
      toast.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const rawMessages = messagesData?.page || [];
  const messages: UIMessageItem[] = rawMessages as unknown as UIMessageItem[];
  const availableModels: ModelItem[] = (aiSettings?.availableModels || []) as ModelItem[];

  return (
    <div className="flex h-[calc(100svh-3.5rem)] w-full overflow-hidden bg-background">
      {/* 1. Left Conversation Sidebar */}
      <ConversationSidebar
        threads={threads}
        activeThreadId={activeThread?.agentThreadId || null}
        onSelectThread={(t) => setActiveThread(t)}
        onNewThread={handleNewThread}
        onDeleteThread={handleDeleteThread}
        onRenameThread={handleRenameThread}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenAiSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Main Center Chat Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Workspace Header Bar */}
        <header className="flex h-11 shrink-0 items-center justify-between bg-background/80 px-4 sm:px-6 backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="size-3.5 text-muted-foreground" />
            <h1 className="text-xs font-medium text-foreground tracking-tight truncate max-w-xs sm:max-w-md">
              {activeThread?.title || "New Conversation"}
            </h1>
            <span className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {aiSettings?.provider === "openai" ? "OpenAI" : "Gemini"}: {activeModel}
            </span>
          </div>

          {!aiSettings?.isConfigured && (
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              <Key className="size-3" />
              <span>Configure Key</span>
            </button>
          )}
        </header>

        {/* Message Stream */}
        <ChatMessageList
          messages={messages}
          isSending={isSending}
          activeModelName={activeModel}
          onSelectSuggestion={(prompt) => handleSendMessage(prompt)}
          messagesEndRef={messagesEndRef}
        />

        {/* Floating Bottom Prompt Bar */}
        <ChatPromptInput
          onSendMessage={handleSendMessage}
          isSending={isSending}
          isConfigured={Boolean(aiSettings?.isConfigured)}
          activeModel={activeModel}
          availableModels={availableModels}
          provider={aiSettings?.provider}
          onModelChange={handleModelChange}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* 3. Standalone AI Settings Dialog */}
      <AiSettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
