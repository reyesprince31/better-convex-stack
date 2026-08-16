import { defineTable } from "convex/server";
import { v } from "convex/values";
import { subscriptionTierValidator } from "../entitlements/schema";

export const announcementToneValidator = v.union(
  v.literal("info"),
  v.literal("success"),
  v.literal("warning"),
  v.literal("critical"),
);

export const announcementSurfaceValidator = v.union(v.literal("public"), v.literal("protected"));

export const platformRoleValidator = v.union(v.literal("user"), v.literal("admin"));

export const announcementTables = {
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
};
