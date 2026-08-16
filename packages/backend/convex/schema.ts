import { defineSchema } from "convex/server";

import { agentTables } from "./agent/schema";
import { announcementTables } from "./announcements/schema";
import { auditTables } from "./audit/schema";
import { entitlementTables } from "./entitlements/schema";

// Re-export domain validators for backwards compatibility
export * from "./agent/schema";
export * from "./announcements/schema";
export * from "./audit/schema";
export * from "./entitlements/schema";

/**
 * Root database schema composing feature-driven tables.
 */
export default defineSchema({
  ...auditTables,
  ...announcementTables,
  ...entitlementTables,
  ...agentTables,
});
