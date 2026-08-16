import { v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { authComponent } from "../auth";
import { agent } from "./definitions";

/**
 * Action to send a message to the agent and generate a durable AI response.
 */
export const sendMessage = action({
  args: {
    threadId: v.string(),
    prompt: v.string(),
    agentName: v.optional(v.string()),
    contextOptions: v.optional(
      v.object({
        recentMessages: v.optional(v.number()),
        excludeToolMessages: v.optional(v.boolean()),
        searchOtherThreads: v.optional(v.boolean()),
        searchOptions: v.optional(
          v.object({
            limit: v.number(),
            textSearch: v.optional(v.boolean()),
            vectorSearch: v.optional(v.boolean()),
            messageRange: v.optional(
              v.object({
                before: v.number(),
                after: v.number(),
              }),
            ),
          }),
        ),
      }),
    ),
  },
  returns: v.object({
    text: v.string(),
    agentName: v.string(),
  }),
  handler: async (ctx, args) => {
    const trimmedPrompt = args.prompt.trim();
    if (!trimmedPrompt) {
      throw new Error("Prompt cannot be empty.");
    }

    const agentDisplayName = args.agentName || "Antigravity Assistant";

    // Update the thread's timestamp & title preview
    try {
      if ((internal as any).agent?.threads?.touchThread) {
        await ctx.runMutation((internal as any).agent.threads.touchThread, {
          threadId: args.threadId,
          title: trimmedPrompt,
        });
      } else if ((internal as any).agent?.touchThread) {
        await ctx.runMutation((internal as any).agent.touchThread, {
          threadId: args.threadId,
          title: trimmedPrompt,
        });
      }
    } catch (e) {
      console.warn("Failed to touch thread:", e);
    }

    try {
      // Generate response and persist history in Convex via @convex-dev/agent
      const result = await agent.generateText(
        ctx,
        { threadId: args.threadId },
        { prompt: trimmedPrompt },
        {
          contextOptions: args.contextOptions,
        },
      );

      return {
        text: result.text,
        agentName: agentDisplayName,
      };
    } catch (error: any) {
      console.error("Error generating agent response:", error);
      throw new Error(
        error?.message ||
          "Failed to generate AI response. Please ensure OPENAI_API_KEY is configured in Convex.",
      );
    }
  },
});

/**
 * Action to fetch the context messages that the agent would include in its prompt.
 */
export const fetchPromptContext = action({
  args: {
    threadId: v.optional(v.string()),
    agentName: v.optional(v.string()),
    searchText: v.optional(v.string()),
    contextOptions: v.optional(
      v.object({
        recentMessages: v.optional(v.number()),
        excludeToolMessages: v.optional(v.boolean()),
        searchOtherThreads: v.optional(v.boolean()),
        searchOptions: v.optional(
          v.object({
            limit: v.number(),
            textSearch: v.optional(v.boolean()),
            vectorSearch: v.optional(v.boolean()),
            messageRange: v.optional(
              v.object({
                before: v.number(),
                after: v.number(),
              }),
            ),
          }),
        ),
      }),
    ),
  },
  returns: v.array(
    v.object({
      _id: v.string(),
      role: v.string(),
      text: v.string(),
      _creationTime: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const userId = user ? String(user._id) : undefined;

    try {
      const messages = await agent.fetchContextMessages(ctx, {
        userId,
        threadId: args.threadId,
        searchText: args.searchText,
        contextOptions: args.contextOptions ?? {
          recentMessages: 10,
          excludeToolMessages: true,
          searchOtherThreads: false,
        },
      });

      return messages.map((m: any, idx: number) => ({
        _id: m._id || `ctx-${idx}`,
        role: m.message?.role || (m.role ?? "user"),
        text:
          m.text ||
          (typeof m.message?.content === "string"
            ? m.message.content
            : JSON.stringify(m.message?.content || "")),
        _creationTime: m._creationTime || Date.now(),
      }));
    } catch (err) {
      console.warn("fetchPromptContext fallback:", err);
      return [];
    }
  },
});
