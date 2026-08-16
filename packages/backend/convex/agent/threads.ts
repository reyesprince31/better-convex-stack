import { createThread, listUIMessages } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { components } from "../_generated/api";
import { internalMutation, mutation, query } from "../_generated/server";
import { authComponent } from "../auth";

/**
 * Mutation to create a new chat thread and store it in our chatThreads table.
 */
export const createChatThread = mutation({
  args: {
    title: v.optional(v.string()),
  },
  returns: v.object({
    threadId: v.string(),
    chatThreadId: v.id("chatThreads"),
    title: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const userId = user ? String(user._id) : undefined;
    const title = args.title?.trim() || "New Chat";
    const now = Date.now();

    const threadId = await createThread(ctx, components.agent, {
      userId,
      title,
    });

    const chatThreadId = await ctx.db.insert("chatThreads", {
      userId,
      threadId,
      title,
      createdAt: now,
      updatedAt: now,
    });

    return {
      threadId,
      chatThreadId,
      title,
    };
  },
});

/**
 * Mutation to delete a chat thread.
 */
export const deleteChatThread = mutation({
  args: {
    threadId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const userId = user ? String(user._id) : undefined;

    const thread = await ctx.db
      .query("chatThreads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      return false;
    }

    // Ensure users can only delete their own threads if authenticated
    if (userId && thread.userId && thread.userId !== userId) {
      throw new Error("Unauthorized to delete this thread.");
    }

    await ctx.db.delete("chatThreads", thread._id);
    return true;
  },
});

/**
 * Query to list chat threads for the current user (bounded to 50 items).
 */
export const listChatThreads = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("chatThreads"),
      threadId: v.string(),
      title: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      snippet: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const userId = user ? String(user._id) : undefined;

    let threads;
    if (userId) {
      threads = await ctx.db
        .query("chatThreads")
        .withIndex("by_userId_and_updatedAt", (q) => q.eq("userId", userId))
        .order("desc")
        .take(50);
    } else {
      threads = await ctx.db.query("chatThreads").withIndex("by_updatedAt").order("desc").take(50);
    }

    return threads.map((t) => ({
      _id: t._id,
      threadId: t.threadId,
      title: t.title,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      snippet: t.title !== "New Chat" ? `Discussion regarding ${t.title}` : undefined,
    }));
  },
});

/**
 * Query to fetch a single thread metadata by threadId.
 */
export const getChatThread = query({
  args: {
    threadId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("chatThreads"),
      threadId: v.string(),
      title: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("chatThreads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      return null;
    }

    return {
      _id: thread._id,
      threadId: thread.threadId,
      title: thread.title,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    };
  },
});

/**
 * Internal mutation to update a thread's updatedAt timestamp and title preview.
 */
export const touchThread = internalMutation({
  args: {
    threadId: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("chatThreads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (thread) {
      const updates: { updatedAt: number; title?: string } = {
        updatedAt: Date.now(),
      };
      if (args.title && (thread.title === "New Chat" || !thread.title)) {
        updates.title = args.title.slice(0, 40);
      }
      await ctx.db.patch("chatThreads", thread._id, updates);
    }
  },
});

/**
 * Query to list messages for a thread via @convex-dev/agent component.
 */
export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await listUIMessages(ctx, components.agent, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });
  },
});
