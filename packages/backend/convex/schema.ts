import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const auditActionValidator = v.union(
  v.literal("account.delete.denied"),
  v.literal("account.delete"),
  v.literal("announcement.create"),
  v.literal("announcement.update"),
  v.literal("announcement.remove"),
  v.literal("organization.create"),
  v.literal("organization.update"),
  v.literal("organization.delete"),
  v.literal("member.add"),
  v.literal("member.role.update"),
  v.literal("member.delete"),
  v.literal("user.tier.update"),
  v.literal("user.delete"),
);

export const announcementToneValidator = v.union(
  v.literal("info"),
  v.literal("success"),
  v.literal("warning"),
  v.literal("critical"),
);

export const announcementSurfaceValidator = v.union(v.literal("public"), v.literal("protected"));

export const platformRoleValidator = v.union(v.literal("user"), v.literal("admin"));

export const subscriptionTierValidator = v.union(
  v.literal("free"),
  v.literal("pro"),
  v.literal("enterprise"),
);

export default defineSchema({
  auditLogs: defineTable({
    action: auditActionValidator,
    actorUserId: v.string(),
    targetId: v.string(),
    createdAt: v.number(),
  })
    .index("by_actorUserId_and_createdAt", ["actorUserId", "createdAt"])
    .index("by_action_and_createdAt", ["action", "createdAt"]),
  announcements: defineTable({
    title: v.optional(v.string()),
    message: v.string(),
    ctaLabel: v.optional(v.string()),
    ctaHref: v.optional(v.string()),
    tone: announcementToneValidator,
    surface: announcementSurfaceValidator,
    routePatterns: v.array(v.string()),
    targetRoles: v.array(platformRoleValidator),
    targetTiers: v.array(subscriptionTierValidator),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    published: v.boolean(),
    priority: v.number(),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_surface_and_published_and_priority", ["surface", "published", "priority"])
    .index("by_updatedAt", ["updatedAt"]),
  userEntitlements: defineTable({
    userId: v.string(),
    tier: subscriptionTierValidator,
    updatedByUserId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_updatedAt", ["updatedAt"]),
  aiSettings: defineTable({
    userId: v.optional(v.string()),
    keyIdentifier: v.string(),
    provider: v.optional(v.union(v.literal("google"), v.literal("openai"))),
    apiKey: v.string(),
    model: v.string(),
    availableModels: v.array(
      v.object({
        id: v.string(),
        displayName: v.string(),
        description: v.optional(v.string()),
      }),
    ),
    openaiApiKey: v.optional(v.string()),
    openaiModel: v.optional(v.string()),
    openaiAvailableModels: v.optional(
      v.array(
        v.object({
          id: v.string(),
          displayName: v.string(),
          description: v.optional(v.string()),
        }),
      ),
    ),
    updatedAt: v.number(),
  })
    .index("by_keyIdentifier", ["keyIdentifier"])
    .index("by_userId", ["userId"]),
  threads: defineTable({
    userId: v.string(),
    agentThreadId: v.string(),
    title: v.string(),
    model: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId_and_updatedAt", ["userId", "updatedAt"])
    .index("by_agentThreadId", ["agentThreadId"]),
});
