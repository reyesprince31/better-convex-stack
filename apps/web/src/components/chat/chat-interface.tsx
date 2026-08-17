"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { ThreadListItem, UIMessageItem } from "./chat-types";
import { mapRawMessagesToUI } from "./chat-utils";
import { ChatWindow } from "./chat-window/chat-window";
import { ConversationList } from "./conversation-list/conversation-list";
import { InspectorPanel } from "./inspector/inspector-panel";

export function ChatInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadParam = searchParams.get("thread");

  const [activeThreadId, setActiveThreadId] = useState<string | null>(threadParam);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [selectedMessageForInspector, setSelectedMessageForInspector] =
    useState<UIMessageItem | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<
    { role: "user" | "assistant"; text: string; id: string }[]
  >([]);

  // Convex Queries & Mutations
  const rawThreads = useQuery(api.agent.listChatThreads);
  const createThreadMutation = useMutation(api.agent.createChatThread);
  const deleteThreadMutation = useMutation(api.agent.deleteChatThread);
  const sendMessageAction = useAction(api.agent.sendMessage);

  // Sync state if URL search param changes
  useEffect(() => {
    if (threadParam && threadParam !== activeThreadId) {
      setActiveThreadId(threadParam);
    }
  }, [threadParam, activeThreadId]);

  // Set default active thread if none selected and threads exist
  useEffect(() => {
    if (!activeThreadId && rawThreads && rawThreads.length > 0) {
      const first = rawThreads[0];
      if (first?.threadId) {
        setActiveThreadId(first.threadId);
      }
    }
  }, [activeThreadId, rawThreads]);

  const activeThread = rawThreads?.find((t) => t.threadId === activeThreadId) || null;

  // Query paginated messages for active thread
  const messagesResult = useQuery(
    api.agent.listThreadMessages,
    activeThreadId
      ? {
          threadId: activeThreadId,
          paginationOpts: { numItems: 50, cursor: null },
        }
      : "skip",
  );

  const uiMessages = mapRawMessagesToUI(messagesResult?.page, activeThreadId);

  // Handle Thread Switching
  const handleSelectThread = useCallback(
    (threadId: string) => {
      setActiveThreadId(threadId);
      setOptimisticMessages([]);
      setSelectedMessageForInspector(null);
      const params = new URLSearchParams(searchParams.toString());
      params.set("thread", threadId);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Handle Inspector selection (auto-opens inspector if collapsed)
  const handleSelectMessageForInspector = useCallback((msg: UIMessageItem | null) => {
    setSelectedMessageForInspector(msg);
    if (msg) {
      setIsInspectorOpen(true);
    }
  }, []);

  // Handle Thread Creation
  const handleCreateThread = useCallback(async () => {
    try {
      const result = await createThreadMutation({ title: "New Chat" });
      setActiveThreadId(result.threadId);
      setOptimisticMessages([]);
      setSelectedMessageForInspector(null);
      const params = new URLSearchParams(searchParams.toString());
      params.set("thread", result.threadId);
      router.replace(`?${params.toString()}`, { scroll: false });
      toast.success("New conversation started");
    } catch (err: any) {
      toast.error(err.message || "Failed to create thread");
    }
  }, [createThreadMutation, router, searchParams]);

  // Handle Thread Deletion
  const handleDeleteThread = useCallback(
    async (threadId: string) => {
      try {
        await deleteThreadMutation({ threadId });
        toast.success("Conversation removed");
        if (activeThreadId === threadId) {
          setActiveThreadId(null);
          const params = new URLSearchParams(searchParams.toString());
          params.delete("thread");
          router.replace(`?${params.toString()}`, { scroll: false });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to delete thread");
      }
    },
    [activeThreadId, deleteThreadMutation, router, searchParams],
  );

  // Handle Message Submission
  const handleSendMessage = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const prompt = inputPrompt.trim();
      if (!prompt || isSending) return;

      let targetThreadId = activeThreadId;
      setIsSending(true);
      setInputPrompt("");

      try {
        // Create a new thread if none is active
        if (!targetThreadId) {
          const newThread = await createThreadMutation({
            title: prompt.slice(0, 40),
          });
          targetThreadId = newThread.threadId;
          setActiveThreadId(targetThreadId);
          const params = new URLSearchParams(searchParams.toString());
          params.set("thread", targetThreadId);
          router.replace(`?${params.toString()}`, { scroll: false });
        }

        // Add optimistic user message
        const optimisticId = `opt-${Date.now()}`;
        setOptimisticMessages([{ role: "user", text: prompt, id: optimisticId }]);

        // Send message action to Convex Agent backend
        const response = await sendMessageAction({
          threadId: targetThreadId,
          prompt,
          agentName: "Antigravity Assistant",
        });

        // Set response as selected for inspector
        if (response) {
          setSelectedMessageForInspector({
            key: `res-${Date.now()}`,
            role: "assistant",
            text: response.text,
            _creationTime: Date.now(),
            status: "success",
            agentName: response.agentName,
            threadId: targetThreadId,
            model: "gpt-4o-mini",
          });
        }

        setOptimisticMessages([]);
      } catch (err: any) {
        toast.error(err.message || "Failed to send message");
        setOptimisticMessages([]);
      } finally {
        setIsSending(false);
      }
    },
    [
      inputPrompt,
      isSending,
      activeThreadId,
      createThreadMutation,
      sendMessageAction,
      router,
      searchParams,
    ],
  );

  const threadsList: ThreadListItem[] = (rawThreads || []).map((t) => ({
    _id: t._id,
    threadId: t.threadId,
    title: t.title,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    snippet: t.snippet,
  }));

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Panel 1: Left Conversation List */}
      <ConversationList
        threads={threadsList}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onCreateThread={handleCreateThread}
        onDeleteThread={handleDeleteThread}
        isLoading={rawThreads === undefined}
        isCollapsed={!isSidebarOpen}
        onToggleCollapse={() => setIsSidebarOpen(false)}
      />

      {/* Panel 2: Center Chat Window */}
      <ChatWindow
        activeThreadTitle={activeThread?.title}
        messages={uiMessages}
        optimisticMessages={optimisticMessages}
        isSending={isSending}
        selectedMessageForInspector={selectedMessageForInspector}
        onSelectMessageForInspector={handleSelectMessageForInspector}
        inputPrompt={inputPrompt}
        setInputPrompt={setInputPrompt}
        onSendMessage={handleSendMessage}
        isSidebarCollapsed={!isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        isInspectorCollapsed={!isInspectorOpen}
        onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
      />

      {/* Panel 3: Right Inspector Panel */}
      <InspectorPanel
        selectedMessage={selectedMessageForInspector}
        isCollapsed={!isInspectorOpen}
        onToggleCollapse={() => setIsInspectorOpen(false)}
      />
    </div>
  );
}
