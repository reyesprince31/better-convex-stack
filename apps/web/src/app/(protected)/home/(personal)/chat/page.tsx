import { Suspense } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";

export const metadata = {
  title: "Convex Agent Playground",
  description:
    "Durable AI agent conversations, multi-step tool executions, and context inspector powered by Convex.",
};

export default function ChatPage() {
  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <Suspense
        fallback={
          <div className="flex h-full w-full flex-1 items-center justify-center bg-card/20">
            <div className="space-y-4 w-full max-w-md text-center p-6">
              <Skeleton className="h-10 w-48 mx-auto rounded-lg" />
              <Skeleton className="h-4 w-72 mx-auto rounded-lg" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        }
      >
        <ChatInterface />
      </Suspense>
    </main>
  );
}
