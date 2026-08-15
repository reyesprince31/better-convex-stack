import type { Id } from "@better-convex-stack/backend/convex/_generated/dataModel";

export const announcementTones = ["info", "success", "warning", "critical"] as const;
export const announcementSurfaces = ["public", "protected"] as const;
export const platformRoles = ["user", "admin"] as const;
export const subscriptionTiers = ["free", "pro", "enterprise"] as const;

export type AnnouncementTone = (typeof announcementTones)[number];
export type AnnouncementSurface = (typeof announcementSurfaces)[number];
export type PlatformRole = (typeof platformRoles)[number];
export type SubscriptionTier = (typeof subscriptionTiers)[number];

export type Announcement = {
  _id: Id<"announcements">;
  _creationTime: number;
  title: string | null;
  message: string;
  tone: AnnouncementTone;
  surface: AnnouncementSurface;
  routePatterns: string[];
  targetRoles: PlatformRole[];
  targetTiers: SubscriptionTier[];
  ctaLabel: string | null;
  ctaHref: string | null;
  startsAt: number | null;
  endsAt: number | null;
  published: boolean;
  priority: number;
  createdAt: number;
  updatedAt: number;
  createdByUserId: string;
};

export type AnnouncementFormValues = {
  title: string;
  message: string;
  tone: AnnouncementTone;
  surface: AnnouncementSurface;
  routePatterns: string[];
  targetRoles: PlatformRole[];
  targetTiers: SubscriptionTier[];
  ctaLabel?: string;
  ctaHref?: string;
  startsAt?: number;
  endsAt?: number;
  published: boolean;
  priority: number;
};

export type AnnouncementDialogState =
  | { mode: "create" }
  | { mode: "edit"; announcementId: Id<"announcements"> }
  | { mode: "delete"; announcementId: Id<"announcements"> };

export function parseRoutePatterns(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\n,]+/)
        .map((route) => route.trim())
        .filter(Boolean),
    ),
  );
}

export function toDateTimeInput(value: number | null | undefined) {
  if (value == null) return "";
  const date = new Date(value);
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
}

export function formatAnnouncementWindow(startsAt?: number | null, endsAt?: number | null) {
  if (startsAt == null && endsAt == null) return "No schedule";
  const date = (value: number) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(value);
  if (startsAt != null && endsAt != null) {
    return `${date(startsAt)} to ${date(endsAt)}`;
  }
  return startsAt != null ? `Starts ${date(startsAt)}` : `Ends ${date(endsAt as number)}`;
}

export function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
