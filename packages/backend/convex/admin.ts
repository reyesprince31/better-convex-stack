import { components } from "./_generated/api";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { v } from "convex/values";

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

type AdminContext = QueryCtx | MutationCtx;
type OrganizationRole = "owner" | "admin" | "member";

function isOrganizationRole(role: string): role is OrganizationRole {
  return role === "owner" || role === "admin" || role === "member";
}

async function requireAdmin(ctx: AdminContext) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required.");
  }

  const user = await authComponent.safeGetAuthUser(ctx);
  if (user?.role !== "admin") {
    throw new Error("Admin access required.");
  }

  return user;
}

function boundedLimit(limit: number | undefined) {
  return Math.min(Math.max(limit ?? 100, 1), 100);
}

export const listOrganizations = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(organizationSummary),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.runQuery(components.betterAuth.admin.listOrganizations, {
      limit: boundedLimit(args.limit),
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
      limit: boundedLimit(args.limit),
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
    await requireAdmin(ctx);
    const organization = await createAuth(ctx).api.createOrganization({
      body: {
        name: args.name.trim(),
        slug: args.slug.trim(),
        userId: args.ownerUserId,
        keepCurrentActiveOrganization: false,
      },
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
    role: v.string(),
    userId: v.string(),
  },
  returns: v.object({
    id: v.string(),
    organizationId: v.string(),
    role: v.string(),
    userId: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!isOrganizationRole(args.role)) {
      throw new Error("Unsupported organization role.");
    }

    const member = await createAuth(ctx).api.addMember({
      body: {
        organizationId: args.organizationId,
        role: args.role,
        userId: args.userId,
      },
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
    await requireAdmin(ctx);
    return await ctx.runMutation(components.betterAuth.admin.updateOrganization, {
      organizationId: args.organizationId,
      name: args.name.trim(),
      slug: args.slug.trim(),
    });
  },
});

export const deleteOrganization = mutation({
  args: { organizationId: v.string() },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.runMutation(components.betterAuth.admin.deleteOrganization, args);
  },
});

export const updateMemberRole = mutation({
  args: { memberId: v.string(), role: v.string() },
  returns: memberSummary,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.runMutation(components.betterAuth.admin.updateMemberRole, args);
  },
});

export const deleteMember = mutation({
  args: { memberId: v.string() },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.runMutation(components.betterAuth.admin.deleteMember, args);
  },
});

export const removeUser = mutation({
  args: { userId: v.string() },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (String(admin._id) === args.userId) {
      throw new Error("You cannot remove your own admin account.");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.removeUser({
      body: { userId: args.userId },
      headers,
    });
    await ctx.runMutation(components.betterAuth.admin.deleteUserMemberships, args);

    return { success: true };
  },
});
