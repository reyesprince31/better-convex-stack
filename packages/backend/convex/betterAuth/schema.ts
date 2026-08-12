import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { tables } from "./generatedSchema";

const schema = defineSchema({
  ...tables,
  member: tables.member.index("organizationId_userId", ["organizationId", "userId"]),
  rateLimit: defineTable({
    key: v.string(),
    count: v.number(),
    lastRequest: v.number(),
  }).index("key", ["key"]),
});

export default schema;
