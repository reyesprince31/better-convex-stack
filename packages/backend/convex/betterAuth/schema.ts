import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { tables } from "./generatedSchema";

const schema = defineSchema({
  ...tables,
  member: tables.member.index("organizationId_userId", ["organizationId", "userId"]),
  invitation: tables.invitation
    .index("email_organizationId_status", ["email", "organizationId", "status"])
    .index("organizationId_status", ["organizationId", "status"]),
  rateLimit: defineTable({
    key: v.string(),
    count: v.number(),
    lastRequest: v.number(),
  })
    .index("key", ["key"])
    .index("lastRequest", ["lastRequest"]),
});

export default schema;
