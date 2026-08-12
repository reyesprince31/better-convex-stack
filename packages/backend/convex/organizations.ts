import { query } from "./_generated/server";
import { authComponent } from "./auth";
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

export const getMyOrganizationsMembers = query({
  args: {
    organizationIds: v.optional(v.array(v.string())),
  },
  returns: v.array(organizationMemberSummaryValidator),
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.runQuery(
      components.betterAuth.admin.listOrganizationsMembersForUser,
      {
        userId: String(user._id),
        organizationIds: args.organizationIds,
      }
    );
  },
});
