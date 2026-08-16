import { defineTable } from "convex/server";
import { v } from "convex/values";

export const subscriptionTierValidator = v.union(
  v.literal("free"),
  v.literal("pro"),
  v.literal("enterprise"),
);

export const entitlementTables = {
  userEntitlements: defineTable({
    userId: v.string(),
    tier: subscriptionTierValidator,
    updatedByUserId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_updatedAt", ["updatedAt"]),
};
