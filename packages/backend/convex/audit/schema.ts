import { defineTable } from "convex/server";
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
  v.literal("email.bounced"),
  v.literal("email.complained"),
);

export const auditTables = {
  auditLogs: defineTable({
    action: auditActionValidator,
    actorUserId: v.string(),
    targetId: v.string(),
    createdAt: v.number(),
  })
    .index("by_actorUserId_and_createdAt", ["actorUserId", "createdAt"])
    .index("by_action_and_createdAt", ["action", "createdAt"]),
};
