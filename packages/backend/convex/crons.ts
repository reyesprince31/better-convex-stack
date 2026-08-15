import { cronJobs } from "convex/server";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const crons = cronJobs();

// Remove old and abandoned emails from the resend component every hour
crons.interval("cleanup-old-resend-emails", { hours: 1 }, internal.crons.cleanupResendEmails, {});

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const cleanupResendEmails = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Delete finalized emails older than 7 days
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupOldEmails, {
      olderThan: ONE_WEEK_MS,
    });
    // Keep abandoned emails longer (4 weeks) for debugging
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupAbandonedEmails, {
      olderThan: 4 * ONE_WEEK_MS,
    });
    return null;
  },
});

export default crons;
