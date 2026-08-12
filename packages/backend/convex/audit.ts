import type { Infer } from "convex/values";

import type { MutationCtx } from "./_generated/server";
import { auditActionValidator } from "./schema";

type AuditAction = Infer<typeof auditActionValidator>;

export async function writeAuditLog(
  ctx: MutationCtx,
  event: {
    action: AuditAction;
    actorUserId: string;
    targetId: string;
  },
) {
  await ctx.db.insert("auditLogs", {
    ...event,
    createdAt: Date.now(),
  });
}
