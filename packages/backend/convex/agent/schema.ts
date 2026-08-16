import { defineTable } from "convex/server";
import { v } from "convex/values";

export const agentTables = {
  chatThreads: defineTable({
    userId: v.optional(v.string()),
    threadId: v.string(),
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId_and_updatedAt", ["userId", "updatedAt"])
    .index("by_threadId", ["threadId"])
    .index("by_updatedAt", ["updatedAt"]),
};
