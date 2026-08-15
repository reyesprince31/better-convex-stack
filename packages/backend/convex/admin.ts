import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import {
  boundedAdminLimit,
  limitAdminOperation,
  requireAdmin,
  requireFreshAdmin,
} from "./adminAuth";
import { createAuth } from "./auth";
import { writeAuditLog } from "./audit";
import { ConvexError, v } from "convex/values";

const organizationSummary = v.object({
  id: v.string(),
  name: v.string(),
  slug: v.string(),
  createdAt: v.number(),
  memberCount: v.number(),
  ownerUserId: v.union(v.string(), v.null()),
});

const memberSummary = v.object({
  id: v.string(),
  organizationId: v.string(),
  userId: v.string(),
  role: v.string(),
  createdAt: v.number(),
});

const organizationRoleValidator = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("member"),
);

export const listOrganizations = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(organizationSummary),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.runQuery(components.betterAuth.admin.listOrganizations, {
      limit: boundedAdminLimit(args.limit),
    });
  },
});

export const listMembers = query({
  args: {
    limit: v.optional(v.number()),
    organizationId: v.optional(v.string()),
  },
  returns: v.array(memberSummary),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.runQuery(components.betterAuth.admin.listMembers, {
      limit: boundedAdminLimit(args.limit),
      organizationId: args.organizationId,
    });
  },
});

export const createOrganization = mutation({
  args: {
    name: v.string(),
    ownerUserId: v.string(),
    slug: v.string(),
  },
  returns: v.object({ id: v.string(), name: v.string(), slug: v.string() }),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await limitAdminOperation(ctx, String(admin._id));
    const organization = await createAuth(ctx).api.createOrganization({
      body: {
        name: args.name.trim(),
        slug: args.slug.trim(),
        userId: args.ownerUserId,
        keepCurrentActiveOrganization: false,
      },
    });
    await writeAuditLog(ctx, {
      action: "organization.create",
      actorUserId: String(admin._id),
      targetId: organization.id,
    });

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    };
  },
});

export const addMember = mutation({
  args: {
    organizationId: v.string(),
    role: organizationRoleValidator,
    userId: v.string(),
  },
  returns: v.object({
    id: v.string(),
    organizationId: v.string(),
    role: v.string(),
    userId: v.string(),
  }),
  handler: async (ctx, args) => {
    const { admin } = await requireFreshAdmin(ctx);
    await limitAdminOperation(ctx, String(admin._id));

    const member = await createAuth(ctx).api.addMember({
      body: {
        organizationId: args.organizationId,
        role: args.role,
        userId: args.userId,
      },
    });
    await writeAuditLog(ctx, {
      action: "member.add",
      actorUserId: String(admin._id),
      targetId: member.id,
    });

    return {
      id: member.id,
      organizationId: member.organizationId,
      role: member.role,
      userId: member.userId,
    };
  },
});

export const updateOrganization = mutation({
  args: {
    organizationId: v.string(),
    name: v.string(),
    slug: v.string(),
  },
  returns: v.object({ id: v.string(), name: v.string(), slug: v.string() }),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await limitAdminOperation(ctx, String(admin._id));
    const organization = await ctx.runMutation(components.betterAuth.admin.updateOrganization, {
      organizationId: args.organizationId,
      name: args.name.trim(),
      slug: args.slug.trim(),
    });
    await writeAuditLog(ctx, {
      action: "organization.update",
      actorUserId: String(admin._id),
      targetId: organization.id,
    });
    return organization;
  },
});

export const deleteOrganization = mutation({
  args: { organizationId: v.string() },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const { admin } = await requireFreshAdmin(ctx);
    await limitAdminOperation(ctx, String(admin._id));
    const organization = await ctx.runMutation(
      components.betterAuth.admin.deleteOrganization,
      args,
    );
    await writeAuditLog(ctx, {
      action: "organization.delete",
      actorUserId: String(admin._id),
      targetId: organization.id,
    });
    return organization;
  },
});

export const updateMemberRole = mutation({
  args: { memberId: v.string(), role: organizationRoleValidator },
  returns: memberSummary,
  handler: async (ctx, args) => {
    const { admin } = await requireFreshAdmin(ctx);
    await limitAdminOperation(ctx, String(admin._id));
    const member = await ctx.runMutation(components.betterAuth.admin.updateMemberRole, args);
    await writeAuditLog(ctx, {
      action: "member.role.update",
      actorUserId: String(admin._id),
      targetId: member.id,
    });
    return member;
  },
});

export const deleteMember = mutation({
  args: { memberId: v.string() },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const { admin } = await requireFreshAdmin(ctx);
    await limitAdminOperation(ctx, String(admin._id));
    const member = await ctx.runMutation(components.betterAuth.admin.deleteMember, args);
    await writeAuditLog(ctx, {
      action: "member.delete",
      actorUserId: String(admin._id),
      targetId: member.id,
    });
    return member;
  },
});

export const removeUser = mutation({
  args: { userId: v.string() },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const { admin, auth, headers } = await requireFreshAdmin(ctx);
    if (String(admin._id) === args.userId) {
      throw new ConvexError({
        code: "INVALID_OPERATION",
        message: "You cannot remove your own admin account.",
      });
    }
    await limitAdminOperation(ctx, String(admin._id));

    await auth.api.removeUser({
      body: { userId: args.userId },
      headers,
    });
    await ctx.runMutation(components.betterAuth.admin.deleteUserMemberships, args);
    const entitlement = await ctx.db
      .query("userEntitlements")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (entitlement) {
      await ctx.db.delete("userEntitlements", entitlement._id);
    }
    await writeAuditLog(ctx, {
      action: "user.delete",
      actorUserId: String(admin._id),
      targetId: args.userId,
    });

    return { success: true };
  },
});
