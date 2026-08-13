import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { ConvexError, v } from "convex/values";
import { components } from "./_generated/api";
import { writeAuditLog } from "./audit";

const SENSITIVE_OPERATION_FRESH_AGE_MS = 15 * 60 * 1000;

async function requireFreshUser(ctx: MutationCtx) {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Authentication required." });
  }

  const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
  const session = await auth.api.getSession({
    headers,
    query: { disableCookieCache: true, disableRefresh: true },
  });
  const createdAt = session ? new Date(session.session.createdAt).getTime() : Number.NaN;

  if (
    !session ||
    !Number.isFinite(createdAt) ||
    Date.now() - createdAt >= SENSITIVE_OPERATION_FRESH_AGE_MS
  ) {
    throw new ConvexError({
      code: "FRESH_SESSION_REQUIRED",
      message: "Sign in again before deleting an organization.",
    });
  }

  return { auth, headers, user };
}

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

export const deleteOwnedOrganization = mutation({
  args: { organizationId: v.string() },
  returns: v.object({ id: v.string() }),
  handler: async (ctx, args) => {
    const { auth, headers, user } = await requireFreshUser(ctx);
    const membership = await auth.api.getActiveMemberRole({
      headers,
      query: { organizationId: args.organizationId },
    });
    if (!membership.role.split(",").includes("owner")) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only an organization owner can delete this organization.",
      });
    }

    const organization = await ctx.runMutation(components.betterAuth.admin.deleteOrganization, {
      organizationId: args.organizationId,
    });
    await writeAuditLog(ctx, {
      action: "organization.delete",
      actorUserId: String(user._id),
      targetId: organization.id,
    });
    return organization;
  },
});
