import { v } from "convex/values";

import { components } from "./_generated/api";
import { mutation } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

export const deleteCurrentUser = mutation({
  args: { password: v.string() },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Authentication required.");
    }

    if (!args.password.trim()) {
      throw new Error("Your password is required to delete your account.");
    }

    await ctx.runMutation(components.betterAuth.admin.deleteUserMemberships, {
      userId: String(user._id),
    });

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.deleteUser({
      body: { password: args.password },
      headers,
    });

    return { success: true };
  },
});
