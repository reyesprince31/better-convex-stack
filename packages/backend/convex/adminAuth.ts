import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { rateLimiter } from "./rateLimits";

type AdminContext = QueryCtx | MutationCtx;
const ADMIN_FRESH_AGE_MS = 15 * 60 * 1000;

export async function requireAdmin(ctx: AdminContext) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Authentication required." });
  }

  const user = await authComponent.safeGetAuthUser(ctx);
  if (user?.role !== "admin") {
    throw new ConvexError({ code: "FORBIDDEN", message: "Admin access required." });
  }

  return user;
}

export async function requireFreshAdmin(ctx: MutationCtx) {
  const admin = await requireAdmin(ctx);
  const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
  const session = await auth.api.getSession({
    headers,
    query: { disableCookieCache: true, disableRefresh: true },
  });
  const createdAt = session ? new Date(session.session.createdAt).getTime() : Number.NaN;

  if (!session || !Number.isFinite(createdAt) || Date.now() - createdAt >= ADMIN_FRESH_AGE_MS) {
    throw new ConvexError({
      code: "FRESH_SESSION_REQUIRED",
      message: "Sign in again before performing this sensitive admin operation.",
    });
  }

  return { admin, auth, headers };
}

export async function limitAdminOperation(ctx: MutationCtx, actorUserId: string) {
  await rateLimiter.limit(ctx, "adminSensitiveOperation", {
    key: actorUserId,
    throws: true,
  });
}

export function boundedAdminLimit(limit: number | undefined) {
  const requestedLimit = limit ?? 100;
  if (!Number.isFinite(requestedLimit)) {
    throw new ConvexError({ code: "INVALID_LIMIT", message: "Limit must be a finite number." });
  }
  return Math.min(Math.max(Math.trunc(requestedLimit), 1), 100);
}
