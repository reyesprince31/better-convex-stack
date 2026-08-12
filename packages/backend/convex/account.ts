import { ConvexError, v } from "convex/values";

import { components } from "./_generated/api";
import { mutation } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { writeAuditLog } from "./audit";
import { rateLimiter } from "./rateLimits";

export const deleteCurrentUser = mutation({
  args: { password: v.string() },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Authentication required." });
    }

    if (!args.password.trim()) {
      throw new ConvexError({
        code: "PASSWORD_REQUIRED",
        message: "Your password is required to delete your account.",
      });
    }

    const userId = String(user._id);
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await rateLimiter.limit(ctx, "accountDeletionAttempt", {
      key: userId,
      throws: true,
    });

    try {
      await auth.api.verifyPassword({
        body: { password: args.password },
        headers,
      });
    } catch {
      await writeAuditLog(ctx, {
        action: "account.delete.denied",
        actorUserId: userId,
        targetId: userId,
      });
      return { success: false };
    }

    await ctx.runMutation(components.betterAuth.admin.deleteUserMemberships, {
      userId,
    });

    await auth.api.deleteUser({
      body: { password: args.password },
      headers,
    });
    await writeAuditLog(ctx, {
      action: "account.delete",
      actorUserId: userId,
      targetId: userId,
    });

    return { success: true };
  },
});
