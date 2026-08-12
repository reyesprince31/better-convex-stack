import { query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { v } from "convex/values";
import { components } from "./_generated/api";

const memberPreviewValidator = v.object({
  id: v.string(),
  userId: v.string(),
  name: v.string(),
  email: v.string(),
  image: v.union(v.string(), v.null()),
  role: v.string(),
  initials: v.string(),
});

const organizationMemberSummaryValidator = v.object({
  organizationId: v.string(),
  memberCount: v.number(),
  members: v.array(memberPreviewValidator),
});

const invitationSummaryValidator = v.object({
  id: v.string(),
  organizationId: v.string(),
  organizationName: v.string(),
  email: v.string(),
  role: v.string(),
  status: v.string(),
  inviterId: v.string(),
  expiresAt: v.number(),
  createdAt: v.number(),
});

function toTimestamp(value: unknown) {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    if (Number.isFinite(timestamp)) {
      return timestamp;
    }
  }

  throw new Error("Invitation timestamp is invalid.");
}

export const getMyOrganizationsMembers = query({
  args: {},
  returns: v.array(organizationMemberSummaryValidator),
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.runQuery(components.betterAuth.admin.listOrganizationsMembersForUser, {
      userId: String(user._id),
    });
  },
});

export const listMyInvitations = query({
  args: {},
  returns: v.array(invitationSummaryValidator),
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user || !user.emailVerified) {
      return [];
    }

    // The email comes from a verified authenticated user, never from client input.
    const invitations = await createAuth(ctx).api.listUserInvitations({
      query: { email: user.email },
    });

    return invitations.map((invitation) => ({
      id: invitation.id,
      organizationId: invitation.organizationId,
      organizationName: invitation.organizationName,
      email: invitation.email,
      role: String(invitation.role),
      status: invitation.status,
      inviterId: invitation.inviterId,
      expiresAt: toTimestamp(invitation.expiresAt),
      createdAt: toTimestamp(invitation.createdAt),
    }));
  },
});
