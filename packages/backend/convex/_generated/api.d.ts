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
import type * as announcementRules from "../announcementRules.js";
import type * as announcements from "../announcements.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as entitlements from "../entitlements.js";
import type * as files from "../files.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as organizations from "../organizations.js";
import type * as privateData from "../privateData.js";
import type * as rateLimits from "../rateLimits.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  account: typeof account;
  admin: typeof admin;
  adminAuth: typeof adminAuth;
  announcementRules: typeof announcementRules;
  announcements: typeof announcements;
  audit: typeof audit;
  auth: typeof auth;
  chat: typeof chat;
  entitlements: typeof entitlements;
  files: typeof files;
  healthCheck: typeof healthCheck;
  http: typeof http;
  organizations: typeof organizations;
  privateData: typeof privateData;
  rateLimits: typeof rateLimits;
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
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
};
