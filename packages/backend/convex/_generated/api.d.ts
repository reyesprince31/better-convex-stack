/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account from "../account.js";
import type * as admin from "../admin.js";
import type * as adminAuth from "../adminAuth.js";
import type * as agent from "../agent.js";
import type * as agent_actions from "../agent/actions.js";
import type * as agent_definitions from "../agent/definitions.js";
import type * as agent_index from "../agent/index.js";
import type * as agent_threads from "../agent/threads.js";
import type * as agent_tools from "../agent/tools.js";
import type * as announcementRules from "../announcementRules.js";
import type * as announcements from "../announcements.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as entitlements from "../entitlements.js";
import type * as files from "../files.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as organizations from "../organizations.js";
import type * as privateData from "../privateData.js";
import type * as rateLimits from "../rateLimits.js";
import type * as resend_index from "../resend/index.js";
import type * as resend_templates from "../resend/templates.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  account: typeof account;
  admin: typeof admin;
  adminAuth: typeof adminAuth;
  agent: typeof agent;
  "agent/actions": typeof agent_actions;
  "agent/definitions": typeof agent_definitions;
  "agent/index": typeof agent_index;
  "agent/threads": typeof agent_threads;
  "agent/tools": typeof agent_tools;
  announcementRules: typeof announcementRules;
  announcements: typeof announcements;
  audit: typeof audit;
  auth: typeof auth;
  crons: typeof crons;
  entitlements: typeof entitlements;
  files: typeof files;
  healthCheck: typeof healthCheck;
  http: typeof http;
  organizations: typeof organizations;
  privateData: typeof privateData;
  rateLimits: typeof rateLimits;
  "resend/index": typeof resend_index;
  "resend/templates": typeof resend_templates;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  r2: import("@convex-dev/r2/_generated/component.js").ComponentApi<"r2">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
};
