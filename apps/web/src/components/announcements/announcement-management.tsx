"use client";

import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { Button } from "@better-convex-stack/ui/components/button";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { useMutation, useQuery } from "convex/react";
import { Megaphone, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AnnouncementDialog } from "./announcement-dialog";
import {
  formatAnnouncementWindow,
  titleCase,
  type Announcement,
  type AnnouncementDialogState,
  type AnnouncementFormValues,
} from "./announcement-types";

export function AnnouncementManagement() {
  const announcements = useQuery(api.announcements.listForAdmin, { limit: 100 }) as
    | Announcement[]
    | undefined;
  const createAnnouncement = useMutation(api.announcements.create);
  const updateAnnouncement = useMutation(api.announcements.update);
  const removeAnnouncement = useMutation(api.announcements.remove);
  const [dialog, setDialog] = useState<AnnouncementDialogState | null>(null);
  const [pending, setPending] = useState(false);

  const selectedAnnouncement =
    dialog && "announcementId" in dialog
      ? announcements?.find((announcement) => announcement._id === dialog.announcementId)
      : undefined;

  async function handleSave(values: AnnouncementFormValues) {
    if (!dialog || (dialog.mode !== "create" && dialog.mode !== "edit")) return;

    setPending(true);
    try {
      const input = compactAnnouncementInput(values);
      if (dialog.mode === "edit") {
        await updateAnnouncement({ announcementId: dialog.announcementId, ...input });
        toast.success("Announcement updated");
      } else {
        await createAnnouncement(input);
        toast.success("Announcement created");
      }
      setDialog(null);
    } catch (error) {
      throw new Error(getErrorMessage(error, "The announcement could not be saved."));
    } finally {
      setPending(false);
    }
  }

  async function handleRemove() {
    if (!dialog || dialog.mode !== "delete") return;

    setPending(true);
    try {
      await removeAnnouncement({ announcementId: dialog.announcementId });
      toast.success("Announcement removed");
      setDialog(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "The announcement could not be removed."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Administration / communication
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em]">Announcements</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Publish focused messages by route, audience, role, and subscription tier.
          </p>
        </div>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => setDialog({ mode: "create" })}
        >
          <Plus />
          New announcement
        </Button>
      </section>

      <AnnouncementDirectory
        announcements={announcements}
        onEdit={(announcement) => setDialog({ mode: "edit", announcementId: announcement._id })}
        onRemove={(announcement) => setDialog({ mode: "delete", announcementId: announcement._id })}
      />

      <AnnouncementDialog
        state={dialog}
        announcement={selectedAnnouncement}
        isPending={pending}
        onClose={() => setDialog(null)}
        onSave={handleSave}
        onRemove={handleRemove}
      />
    </div>
  );
}

function AnnouncementDirectory({
  announcements,
  onEdit,
  onRemove,
}: {
  announcements: Announcement[] | undefined;
  onEdit: (announcement: Announcement) => void;
  onRemove: (announcement: Announcement) => void;
}) {
  if (announcements === undefined) {
    return (
      <section
        className="space-y-px border border-border/70 bg-background p-5"
        aria-label="Loading announcements"
      >
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-24 w-full" />
        ))}
      </section>
    );
  }

  if (announcements.length === 0) {
    return (
      <section className="border border-border/70 bg-background p-10 text-center">
        <Megaphone className="mx-auto size-5 text-muted-foreground" strokeWidth={1.5} />
        <h2 className="mt-3 text-sm font-medium">No announcements yet</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Create a draft, choose its routes, then publish when it is ready.
        </p>
      </section>
    );
  }

  return (
    <section
      className="border border-border/70 bg-background"
      aria-labelledby="announcement-list-title"
    >
      <div className="flex items-center justify-between border-b border-border/70 p-5 sm:p-6">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            Message queue
          </p>
          <h2 id="announcement-list-title" className="mt-2 text-lg font-medium">
            {announcements.length} announcement{announcements.length === 1 ? "" : "s"}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {announcements.filter((announcement) => announcement.published).length} published
        </p>
      </div>
      <div className="divide-y divide-border/70">
        {announcements.map((announcement) => (
          <AnnouncementRow
            key={announcement._id}
            announcement={announcement}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}

function AnnouncementRow({
  announcement,
  onEdit,
  onRemove,
}: {
  announcement: Announcement;
  onEdit: (announcement: Announcement) => void;
  onRemove: (announcement: Announcement) => void;
}) {
  const audience =
    announcement.surface === "public"
      ? "Public visitors"
      : [
          announcement.targetRoles.length > 0
            ? announcement.targetRoles.map(titleCase).join(", ")
            : "All roles",
          announcement.targetTiers.length > 0
            ? announcement.targetTiers.map(titleCase).join(", ")
            : "All tiers",
        ].join(" / ");

  return (
    <article className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-sm font-medium">{announcement.title ?? "Untitled announcement"}</h3>
          <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
            {announcement.published ? "Published" : "Draft"}
          </span>
          <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
            {titleCase(announcement.tone)}
          </span>
        </div>
        <p className="mt-1 max-w-3xl text-xs/relaxed text-muted-foreground">
          {announcement.message}
        </p>
        <dl className="mt-4 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2 xl:grid-cols-4">
          <Metadata label="Routes" value={announcement.routePatterns.join(", ")} />
          <Metadata label="Audience" value={audience} />
          <Metadata
            label="Schedule"
            value={formatAnnouncementWindow(announcement.startsAt, announcement.endsAt)}
          />
          <Metadata label="Priority" value={String(announcement.priority)} />
        </dl>
      </div>
      <div className="flex items-center gap-2 lg:justify-end">
        <Button type="button" variant="outline" size="sm" onClick={() => onEdit(announcement)}>
          Edit
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(announcement)}>
          Remove
        </Button>
      </div>
    </article>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] tracking-[0.1em] text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 truncate text-foreground" title={value}>
        {value}
      </dd>
    </div>
  );
}

function compactAnnouncementInput(values: AnnouncementFormValues) {
  const { ctaHref, ctaLabel, startsAt, endsAt, ...required } = values;
  return {
    ...required,
    ...(ctaLabel ? { ctaLabel } : {}),
    ...(ctaHref ? { ctaHref } : {}),
    ...(startsAt !== undefined ? { startsAt } : {}),
    ...(endsAt !== undefined ? { endsAt } : {}),
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}
