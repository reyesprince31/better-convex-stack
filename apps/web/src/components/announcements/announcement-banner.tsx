"use client";

import { api } from "@better-convex-stack/backend/convex/_generated/api";
import type { Id } from "@better-convex-stack/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useEffect, useState } from "react";

type AnnouncementTone = "critical" | "info" | "success" | "warning";

type VisibleAnnouncement = {
  _id: Id<"announcements">;
  title: string | null;
  message: string;
  tone: AnnouncementTone;
  ctaLabel: string | null;
  ctaHref: string | null;
};

const toneStyles: Record<AnnouncementTone, { className: string; icon: LucideIcon }> = {
  info: {
    className: "bg-sky-700 text-white dark:bg-sky-300 dark:text-sky-950",
    icon: Info,
  },
  success: {
    className: "bg-emerald-700 text-white dark:bg-emerald-300 dark:text-emerald-950",
    icon: CircleCheck,
  },
  warning: {
    className: "bg-amber-300 text-amber-950 dark:bg-amber-300 dark:text-amber-950",
    icon: TriangleAlert,
  },
  critical: {
    className: "bg-destructive text-destructive-foreground",
    icon: CircleX,
  },
};

export function AnnouncementBanner() {
  const pathname = usePathname();
  const [now, setNow] = useState(() => Date.now());
  const announcements = useQuery(api.announcements.listForViewer, {
    now,
    pathname,
  }) as VisibleAnnouncement[] | undefined;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  if (!announcements || announcements.length === 0) return null;

  return (
    <section aria-label="Announcements" className="shrink-0">
      {announcements.map((announcement) => {
        const style = toneStyles[announcement.tone];
        const Icon = style.icon;

        return (
          <div
            key={announcement._id}
            className={`${style.className} border-b border-current/15`}
            role={announcement.tone === "critical" ? "alert" : "status"}
          >
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-2.5 sm:flex-row sm:items-center sm:justify-center sm:gap-3 sm:px-8">
              <div className="flex min-w-0 items-start gap-2.5 sm:items-center">
                <Icon className="mt-0.5 size-4 shrink-0 sm:mt-0" strokeWidth={1.5} />
                <p className="text-sm leading-5">
                  {announcement.title ? (
                    <span className="font-semibold">{announcement.title} </span>
                  ) : null}
                  <span className="opacity-90">{announcement.message}</span>
                </p>
              </div>
              {announcement.ctaLabel && announcement.ctaHref ? (
                <AnnouncementLink href={announcement.ctaHref} label={announcement.ctaLabel} />
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function AnnouncementLink({ href, label }: { href: string; label: string }) {
  const className =
    "ml-6 inline-flex w-fit shrink-0 items-center gap-1.5 text-xs font-semibold underline decoration-current/50 underline-offset-4 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 sm:ml-0";
  const content = (
    <>
      {label}
      <ArrowRight className="size-3.5" strokeWidth={1.5} />
    </>
  );

  return href.startsWith("/") ? (
    <Link href={href as Route} className={className}>
      {content}
    </Link>
  ) : (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {content}
    </a>
  );
}
