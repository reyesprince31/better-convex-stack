import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
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

export const listOrganizations = query({
  args: { limit: v.number() },
  returns: v.array(organizationSummary),
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit, 1), 100);
    const organizations = await ctx.db.query("organization").order("desc").take(limit);

    return await Promise.all(
      organizations.map(async (organization) => {
        const members = await ctx.db
          .query("member")
          .withIndex("organizationId", (q) => q.eq("organizationId", String(organization._id)))
          .take(101);
        const owner = members.find((member) => member.role.split(",").includes("owner"));

        return {
          id: String(organization._id),
          name: organization.name,
          slug: organization.slug,
          createdAt: organization.createdAt,
          memberCount: members.length > 100 ? 100 : members.length,
          ownerUserId: owner?.userId ?? null,
        };
      }),
    );
  },
});

export const listMembers = query({
  args: {
    limit: v.number(),
    organizationId: v.optional(v.string()),
  },
  returns: v.array(memberSummary),
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit, 1), 100);
    const members = args.organizationId
      ? await ctx.db
          .query("member")
          .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId!))
          .order("desc")
          .take(limit)
      : await ctx.db.query("member").order("desc").take(limit);

    return members.map((member) => ({
      id: String(member._id),
      organizationId: member.organizationId,
      userId: member.userId,
      role: member.role,
      createdAt: member.createdAt,
    }));
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
    const organization = await ctx.db.get(args.organizationId as Id<"organization">);
    if (!organization) {
      throw new Error("Organization not found.");
    }

    const existing = await ctx.db
      .query("organization")
      .withIndex("slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing && existing._id !== organization._id) {
      throw new Error("That slug is already in use.");
    }

    await ctx.db.patch(organization._id, {
      name: args.name,
      slug: args.slug,
    });

    return { id: String(organization._id), name: args.name, slug: args.slug };
  },
});

export const deleteOrganization = mutation({
  args: { organizationId: v.string() },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId as Id<"organization">);
    if (!organization) {
      throw new Error("Organization not found.");
    }

    const members = await ctx.db
      .query("member")
      .withIndex("organizationId", (q) => q.eq("organizationId", String(organization._id)))
      .take(500);
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    const invitations = await ctx.db
      .query("invitation")
      .withIndex("organizationId", (q) => q.eq("organizationId", String(organization._id)))
      .take(500);
    for (const invitation of invitations) {
      await ctx.db.delete(invitation._id);
    }

    await ctx.db.delete(organization._id);
    return { id: String(organization._id) };
  },
});

export const updateMemberRole = mutation({
  args: {
    memberId: v.string(),
    role: v.string(),
  },
  returns: memberSummary,
  handler: async (ctx, args) => {
    if (!args.role.trim()) {
      throw new Error("A member role is required.");
    }

    const member = await ctx.db.get(args.memberId as Id<"member">);
    if (!member) {
      throw new Error("Member not found.");
    }

    if (member.role.split(",").includes("owner") && args.role !== member.role) {
      const owners = await ctx.db
        .query("member")
        .withIndex("organizationId", (q) => q.eq("organizationId", member.organizationId))
        .take(500);
      if (owners.filter((item) => item.role.split(",").includes("owner")).length <= 1) {
        throw new Error("An organization must keep at least one owner.");
      }
    }

    await ctx.db.patch(member._id, { role: args.role });
    return {
      id: String(member._id),
      organizationId: member.organizationId,
      userId: member.userId,
      role: args.role,
      createdAt: member.createdAt,
    };
  },
});

export const deleteMember = mutation({
  args: { memberId: v.string() },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId as Id<"member">);
    if (!member) {
      throw new Error("Member not found.");
    }

    if (member.role.split(",").includes("owner")) {
      const owners = await ctx.db
        .query("member")
        .withIndex("organizationId", (q) => q.eq("organizationId", member.organizationId))
        .take(500);
      if (owners.filter((item) => item.role.split(",").includes("owner")).length <= 1) {
        throw new Error("An organization must keep at least one owner.");
      }
    }

    await ctx.db.delete(member._id);
    return { id: String(member._id) };
  },
});

export const deleteUserMemberships = mutation({
  args: { userId: v.string() },
  returns: v.object({ count: v.number() }),
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("member")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .take(500);

    for (const member of members) {
      if (member.role.split(",").includes("owner")) {
        const owners = await ctx.db
          .query("member")
          .withIndex("organizationId", (q) => q.eq("organizationId", member.organizationId))
          .take(500);
        if (owners.filter((item) => item.role.split(",").includes("owner")).length <= 1) {
          throw new Error("Transfer organization ownership before removing this user.");
        }
      }
      await ctx.db.delete(member._id);
    }

    return { count: members.length };
  },
});
