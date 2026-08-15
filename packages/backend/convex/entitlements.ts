import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  boundedAdminLimit,
  limitAdminOperation,
  requireAdmin,
  requireFreshAdmin,
} from "./adminAuth";
import { writeAuditLog } from "./audit";
import { subscriptionTierValidator } from "./schema";

const entitlementValidator = v.object({
  _id: v.id("userEntitlements"),
  _creationTime: v.number(),
  userId: v.string(),
  tier: subscriptionTierValidator,
  updatedByUserId: v.string(),
  updatedAt: v.number(),
});

function normalizeUserId(userId: string) {
  const normalized = userId.trim();
  const hasControlCharacter = [...normalized].some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127;
  });
  if (!normalized || normalized.length > 200 || hasControlCharacter) {
    throw new ConvexError({ code: "INVALID_USER_ID", message: "A valid user ID is required." });
  }
  return normalized;
}

export const listForAdmin = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(entitlementValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("userEntitlements")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(boundedAdminLimit(args.limit));
  },
});

export const listForUsers = query({
  args: { userIds: v.array(v.string()) },
  returns: v.array(entitlementValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.userIds.length > 100) {
      throw new ConvexError({
        code: "TOO_MANY_USERS",
        message: "Request entitlements for at most 100 users at a time.",
      });
    }
    const userIds = [...new Set(args.userIds.map(normalizeUserId))];
    const entitlements = await Promise.all(
      userIds.map((userId) =>
        ctx.db
          .query("userEntitlements")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .unique(),
      ),
    );
    return entitlements.filter((entitlement) => entitlement !== null);
  },
});

export const setTier = mutation({
  args: { userId: v.string(), tier: subscriptionTierValidator },
  returns: entitlementValidator,
  handler: async (ctx, args) => {
    const { admin } = await requireFreshAdmin(ctx);
    const actorUserId = String(admin._id);
    await limitAdminOperation(ctx, actorUserId);
    const userId = normalizeUserId(args.userId);
    const existing = await ctx.db
      .query("userEntitlements")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const updatedAt = Date.now();

    let entitlementId;
    if (existing) {
      await ctx.db.patch("userEntitlements", existing._id, {
        tier: args.tier,
        updatedByUserId: actorUserId,
        updatedAt,
      });
      entitlementId = existing._id;
    } else {
      entitlementId = await ctx.db.insert("userEntitlements", {
        userId,
        tier: args.tier,
        updatedByUserId: actorUserId,
        updatedAt,
      });
    }

    await writeAuditLog(ctx, {
      action: "user.tier.update",
      actorUserId,
      targetId: userId,
    });
    const entitlement = await ctx.db.get("userEntitlements", entitlementId);
    if (!entitlement) {
      throw new Error("Entitlement write did not persist.");
    }
    return entitlement;
  },
});
