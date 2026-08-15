import { ConvexError, v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  boundedAdminLimit,
  limitAdminOperation,
  requireAdmin,
  requireFreshAdmin,
} from "./adminAuth";
import {
  classifyPathSurface,
  matchesAnnouncementRules,
  normalizePathname,
  normalizeRoutePatterns,
  type PlatformRole,
  type SubscriptionTier,
} from "./announcementRules";
import { authComponent } from "./auth";
import { writeAuditLog } from "./audit";
import {
  announcementSurfaceValidator,
  announcementToneValidator,
  platformRoleValidator,
  subscriptionTierValidator,
} from "./schema";

const MAX_VIEWER_SCAN_PER_SURFACE = 100;
const MAX_VIEWER_RESULTS = 20;
const MAX_TITLE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 500;
const MAX_CTA_LABEL_LENGTH = 60;
const MAX_CTA_HREF_LENGTH = 2_048;
const MIN_PRIORITY = -1_000;
const MAX_PRIORITY = 1_000;

const viewerAnnouncementValidator = v.object({
  _id: v.id("announcements"),
  title: v.union(v.string(), v.null()),
  message: v.string(),
  ctaLabel: v.union(v.string(), v.null()),
  ctaHref: v.union(v.string(), v.null()),
  tone: announcementToneValidator,
  surface: announcementSurfaceValidator,
  priority: v.number(),
});

const adminAnnouncementValidator = v.object({
  _id: v.id("announcements"),
  _creationTime: v.number(),
  title: v.union(v.string(), v.null()),
  message: v.string(),
  ctaLabel: v.union(v.string(), v.null()),
  ctaHref: v.union(v.string(), v.null()),
  tone: announcementToneValidator,
  surface: announcementSurfaceValidator,
  routePatterns: v.array(v.string()),
  targetRoles: v.array(platformRoleValidator),
  targetTiers: v.array(subscriptionTierValidator),
  startsAt: v.union(v.number(), v.null()),
  endsAt: v.union(v.number(), v.null()),
  published: v.boolean(),
  priority: v.number(),
  createdByUserId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const announcementFields = {
  title: v.optional(v.string()),
  message: v.string(),
  ctaLabel: v.optional(v.string()),
  ctaHref: v.optional(v.string()),
  tone: announcementToneValidator,
  surface: announcementSurfaceValidator,
  routePatterns: v.array(v.string()),
  targetRoles: v.array(platformRoleValidator),
  targetTiers: v.array(subscriptionTierValidator),
  startsAt: v.optional(v.number()),
  endsAt: v.optional(v.number()),
  published: v.boolean(),
  priority: v.number(),
};

type AnnouncementInput = {
  title?: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
  tone: "info" | "success" | "warning" | "critical";
  surface: "public" | "protected";
  routePatterns: string[];
  targetRoles: PlatformRole[];
  targetTiers: SubscriptionTier[];
  startsAt?: number;
  endsAt?: number;
  published: boolean;
  priority: number;
};

function invalid(message: string): never {
  throw new ConvexError({ code: "INVALID_ANNOUNCEMENT", message });
}

function normalizeOptionalText(value: string | undefined, label: string, maxLength: number) {
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }
  if (normalized.length > maxLength) {
    invalid(`${label} must be ${maxLength} characters or fewer.`);
  }
  return normalized;
}

function normalizeTimestamp(value: number | undefined, label: string) {
  if (value === undefined) {
    return undefined;
  }
  if (!Number.isSafeInteger(value) || value < 0) {
    invalid(`${label} must be a non-negative millisecond timestamp.`);
  }
  return value;
}

function normalizeCtaHref(value: string | undefined) {
  const href = normalizeOptionalText(value, "CTA URL", MAX_CTA_HREF_LENGTH);
  if (href === undefined) {
    return undefined;
  }
  if (href.startsWith("/") && !href.startsWith("//")) {
    return href;
  }
  try {
    const url = new URL(href);
    const isLocalHttp =
      url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if (url.protocol === "https:" || isLocalHttp) {
      return url.toString();
    }
  } catch {
    // Report the shared validation error below.
  }
  invalid("CTA URL must be root-relative or use HTTPS.");
}

function normalizeAnnouncementInput(input: AnnouncementInput): AnnouncementInput {
  const message = input.message.trim();
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    invalid(`Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`);
  }

  let routePatterns: string[];
  try {
    routePatterns = normalizeRoutePatterns(input.routePatterns);
  } catch (error) {
    invalid(error instanceof Error ? error.message : "Route patterns are invalid.");
  }

  const title = normalizeOptionalText(input.title, "Title", MAX_TITLE_LENGTH);
  const ctaLabel = normalizeOptionalText(input.ctaLabel, "CTA label", MAX_CTA_LABEL_LENGTH);
  const ctaHref = normalizeCtaHref(input.ctaHref);
  if ((ctaLabel === undefined) !== (ctaHref === undefined)) {
    invalid("CTA label and CTA URL must be provided together.");
  }
  if (
    input.surface === "public" &&
    (input.targetRoles.length > 0 || input.targetTiers.length > 0)
  ) {
    invalid("Public announcements cannot target authenticated roles or tiers.");
  }
  if (input.targetRoles.length > 2 || input.targetTiers.length > 3) {
    invalid("Role and tier targets must use the supported unique audience values.");
  }
  if (
    !Number.isSafeInteger(input.priority) ||
    input.priority < MIN_PRIORITY ||
    input.priority > MAX_PRIORITY
  ) {
    invalid(`Priority must be an integer from ${MIN_PRIORITY} to ${MAX_PRIORITY}.`);
  }

  const startsAt = normalizeTimestamp(input.startsAt, "Start time");
  const endsAt = normalizeTimestamp(input.endsAt, "End time");
  if (startsAt !== undefined && endsAt !== undefined && startsAt >= endsAt) {
    invalid("End time must be later than start time.");
  }

  return {
    message,
    tone: input.tone,
    surface: input.surface,
    routePatterns,
    targetRoles: [...new Set(input.targetRoles)],
    targetTiers: [...new Set(input.targetTiers)],
    published: input.published,
    priority: input.priority,
    ...(title === undefined ? {} : { title }),
    ...(ctaLabel === undefined ? {} : { ctaLabel }),
    ...(ctaHref === undefined ? {} : { ctaHref }),
    ...(startsAt === undefined ? {} : { startsAt }),
    ...(endsAt === undefined ? {} : { endsAt }),
  };
}

function toViewerAnnouncement(announcement: Doc<"announcements">) {
  return {
    _id: announcement._id,
    title: announcement.title ?? null,
    message: announcement.message,
    ctaLabel: announcement.ctaLabel ?? null,
    ctaHref: announcement.ctaHref ?? null,
    tone: announcement.tone,
    surface: announcement.surface,
    priority: announcement.priority,
  };
}

function toAdminAnnouncement(announcement: Doc<"announcements">) {
  return {
    ...announcement,
    title: announcement.title ?? null,
    ctaLabel: announcement.ctaLabel ?? null,
    ctaHref: announcement.ctaHref ?? null,
    startsAt: announcement.startsAt ?? null,
    endsAt: announcement.endsAt ?? null,
  };
}

export const listForViewer = query({
  args: { pathname: v.string(), now: v.number() },
  returns: v.array(viewerAnnouncementValidator),
  handler: async (ctx, args) => {
    let pathname: string;
    try {
      pathname = normalizePathname(args.pathname);
    } catch (error) {
      throw new ConvexError({
        code: "INVALID_PATHNAME",
        message: error instanceof Error ? error.message : "Pathname is invalid.",
      });
    }
    if (!Number.isSafeInteger(args.now) || args.now < 0) {
      throw new ConvexError({
        code: "INVALID_TIME",
        message: "Current time must be a non-negative millisecond timestamp.",
      });
    }

    const surface = classifyPathSurface(pathname);
    let role: PlatformRole | null = null;
    let tier: SubscriptionTier | null = null;
    if (surface === "protected") {
      const user = await authComponent.safeGetAuthUser(ctx);
      if (!user) {
        return [];
      }
      role = user.role === "admin" ? "admin" : "user";
      const entitlement = await ctx.db
        .query("userEntitlements")
        .withIndex("by_userId", (q) => q.eq("userId", String(user._id)))
        .unique();
      tier = entitlement?.tier ?? "free";
    }

    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_surface_and_published_and_priority", (q) =>
        q.eq("surface", surface).eq("published", true),
      )
      .order("desc")
      .take(MAX_VIEWER_SCAN_PER_SURFACE);

    return announcements
      .filter((announcement) =>
        matchesAnnouncementRules(announcement, { pathname, now: args.now, role, tier }),
      )
      .sort((a, b) => b.priority - a.priority || b._creationTime - a._creationTime)
      .slice(0, MAX_VIEWER_RESULTS)
      .map(toViewerAnnouncement);
  },
});

export const listForAdmin = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(adminAnnouncementValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = boundedAdminLimit(args.limit);
    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(limit);
    return announcements.map(toAdminAnnouncement);
  },
});

export const create = mutation({
  args: announcementFields,
  returns: v.id("announcements"),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await limitAdminOperation(ctx, String(admin._id));
    const existing = await ctx.db.query("announcements").withIndex("by_updatedAt").take(1_000);
    if (existing.length >= 1_000) {
      throw new ConvexError({
        code: "ANNOUNCEMENT_LIMIT_REACHED",
        message: "Archive or remove an announcement before creating another.",
      });
    }
    const normalized = normalizeAnnouncementInput(args);
    const now = Date.now();
    const announcementId = await ctx.db.insert("announcements", {
      ...normalized,
      createdByUserId: String(admin._id),
      createdAt: now,
      updatedAt: now,
    });
    await writeAuditLog(ctx, {
      action: "announcement.create",
      actorUserId: String(admin._id),
      targetId: String(announcementId),
    });
    return announcementId;
  },
});

export const update = mutation({
  args: { announcementId: v.id("announcements"), ...announcementFields },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await limitAdminOperation(ctx, String(admin._id));
    const existing = await ctx.db.get("announcements", args.announcementId);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Announcement not found." });
    }
    const { announcementId, ...input } = args;
    const normalized = normalizeAnnouncementInput(input);
    await ctx.db.replace("announcements", announcementId, {
      ...normalized,
      createdByUserId: existing.createdByUserId,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    });
    await writeAuditLog(ctx, {
      action: "announcement.update",
      actorUserId: String(admin._id),
      targetId: String(announcementId),
    });
    return null;
  },
});

export const remove = mutation({
  args: { announcementId: v.id("announcements") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { admin } = await requireFreshAdmin(ctx);
    await limitAdminOperation(ctx, String(admin._id));
    const existing = await ctx.db.get("announcements", args.announcementId);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Announcement not found." });
    }
    await ctx.db.delete("announcements", args.announcementId);
    await writeAuditLog(ctx, {
      action: "announcement.remove",
      actorUserId: String(admin._id),
      targetId: String(args.announcementId),
    });
    return null;
  },
});
