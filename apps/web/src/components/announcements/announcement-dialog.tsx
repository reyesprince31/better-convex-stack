"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import { Checkbox } from "@better-convex-stack/ui/components/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@better-convex-stack/ui/components/dialog";
import { Input } from "@better-convex-stack/ui/components/input";
import { Label } from "@better-convex-stack/ui/components/label";
import { Textarea } from "@better-convex-stack/ui/components/textarea";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import type * as React from "react";

import {
  announcementSurfaces,
  announcementTones,
  parseRoutePatterns,
  platformRoles,
  subscriptionTiers,
  titleCase,
  toDateTimeInput,
  type Announcement,
  type AnnouncementDialogState,
  type AnnouncementFormValues,
  type AnnouncementSurface,
  type AnnouncementTone,
  type PlatformRole,
  type SubscriptionTier,
} from "./announcement-types";

type AnnouncementDialogProps = {
  state: AnnouncementDialogState | null;
  announcement: Announcement | undefined;
  isPending: boolean;
  onClose: () => void;
  onSave: (values: AnnouncementFormValues) => Promise<void>;
  onRemove: () => Promise<void>;
};

export function AnnouncementDialog({
  state,
  announcement,
  isPending,
  onClose,
  onSave,
  onRemove,
}: AnnouncementDialogProps) {
  if (!state) return null;

  const isDelete = state.mode === "delete";

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        {isDelete ? (
          <>
            <DialogHeader>
              <DialogTitle>Remove announcement?</DialogTitle>
              <DialogDescription>
                {announcement?.title ?? "This announcement"} will stop appearing immediately and
                cannot be restored.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose
                render={
                  <Button type="button" variant="ghost" disabled={isPending}>
                    Keep announcement
                  </Button>
                }
              />
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() => void onRemove()}
              >
                {isPending ? "Removing…" : "Remove announcement"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <AnnouncementForm
            key={state.mode === "edit" ? state.announcementId : "new"}
            announcement={announcement}
            isPending={isPending}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AnnouncementForm({
  announcement,
  isPending,
  onSave,
}: {
  announcement: Announcement | undefined;
  isPending: boolean;
  onSave: (values: AnnouncementFormValues) => Promise<void>;
}) {
  const isEditing = announcement !== undefined;
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [message, setMessage] = useState(announcement?.message ?? "");
  const [tone, setTone] = useState<AnnouncementTone>(announcement?.tone ?? "info");
  const [surface, setSurface] = useState<AnnouncementSurface>(announcement?.surface ?? "public");
  const [routes, setRoutes] = useState(announcement?.routePatterns.join(", ") ?? "/");
  const [roles, setRoles] = useState<PlatformRole[]>(announcement?.targetRoles ?? []);
  const [tiers, setTiers] = useState<SubscriptionTier[]>(announcement?.targetTiers ?? []);
  const [ctaLabel, setCtaLabel] = useState(announcement?.ctaLabel ?? "");
  const [ctaHref, setCtaHref] = useState(announcement?.ctaHref ?? "");
  const [startsAt, setStartsAt] = useState(toDateTimeInput(announcement?.startsAt));
  const [endsAt, setEndsAt] = useState(toDateTimeInput(announcement?.endsAt));
  const [priority, setPriority] = useState(String(announcement?.priority ?? 0));
  const [published, setPublished] = useState(announcement?.published ?? false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const routePatterns = parseRoutePatterns(routes);
    const nextTitle = title.trim();
    const nextMessage = message.trim();
    const nextCtaLabel = ctaLabel.trim();
    const nextCtaHref = ctaHref.trim();
    const nextStartsAt = startsAt ? Date.parse(startsAt) : undefined;
    const nextEndsAt = endsAt ? Date.parse(endsAt) : undefined;
    const nextPriority = Number(priority);

    if (!nextTitle) {
      setFormError("Enter a short announcement title.");
      return;
    }
    if (!nextMessage) {
      setFormError("Enter the announcement message.");
      return;
    }
    if (routePatterns.length === 0) {
      setFormError("Add at least one route pattern.");
      return;
    }
    if ((nextCtaLabel && !nextCtaHref) || (!nextCtaLabel && nextCtaHref)) {
      setFormError("Add both a link label and destination, or leave both empty.");
      return;
    }
    if (nextStartsAt !== undefined && nextEndsAt !== undefined && nextStartsAt >= nextEndsAt) {
      setFormError("The end time must be later than the start time.");
      return;
    }
    if (!Number.isInteger(nextPriority) || nextPriority < 0 || nextPriority > 100) {
      setFormError("Priority must be a whole number from 0 to 100.");
      return;
    }

    setFormError(null);
    try {
      await onSave({
        title: nextTitle,
        message: nextMessage,
        tone,
        surface,
        routePatterns,
        targetRoles: surface === "protected" ? roles : [],
        targetTiers: surface === "protected" ? tiers : [],
        ctaLabel: nextCtaLabel || undefined,
        ctaHref: nextCtaHref || undefined,
        startsAt: nextStartsAt,
        endsAt: nextEndsAt,
        priority: nextPriority,
        published,
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "The announcement could not be saved.");
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit announcement" : "New announcement"}</DialogTitle>
        <DialogDescription>
          Choose where this message appears and who can see it. Empty role or tier selections match
          everyone on that surface.
        </DialogDescription>
      </DialogHeader>
      <form
        id="announcement-form"
        className="grid gap-5 px-5 pt-5 sm:grid-cols-2 sm:px-6 sm:pt-6"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="announcement-title">Title</Label>
          <Input
            id="announcement-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            disabled={isPending}
            placeholder="Scheduled maintenance"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="announcement-message">Message</Label>
          <Textarea
            id="announcement-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={280}
            disabled={isPending}
            placeholder="The platform will be unavailable for a short maintenance window."
            className="min-h-20 resize-y"
          />
        </div>
        <SelectField
          id="announcement-tone"
          label="Tone"
          value={tone}
          options={announcementTones}
          disabled={isPending}
          onChange={(value) => setTone(value as AnnouncementTone)}
        />
        <SelectField
          id="announcement-surface"
          label="Surface"
          value={surface}
          options={announcementSurfaces}
          disabled={isPending}
          onChange={(value) => {
            const nextSurface = value as AnnouncementSurface;
            setSurface(nextSurface);
            if (nextSurface === "public") {
              setRoles([]);
              setTiers([]);
            }
          }}
        />
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="announcement-routes">Routes</Label>
          <Input
            id="announcement-routes"
            value={routes}
            onChange={(event) => setRoutes(event.target.value)}
            disabled={isPending}
            placeholder="/, /blog/*"
            aria-describedby="announcement-routes-help"
          />
          <p id="announcement-routes-help" className="text-xs text-muted-foreground">
            Separate routes with commas. Use * for every route or /blog/* for a route section.
          </p>
        </div>
        {surface === "protected" ? (
          <>
            <ChoiceGroup
              legend="Platform roles"
              values={platformRoles}
              selected={roles}
              disabled={isPending}
              onToggle={(role) => setRoles((current) => toggleValue(current, role))}
            />
            <ChoiceGroup
              legend="Subscription tiers"
              values={subscriptionTiers}
              selected={tiers}
              disabled={isPending}
              onToggle={(tier) => setTiers((current) => toggleValue(current, tier))}
            />
          </>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="announcement-cta-label">Link label</Label>
          <Input
            id="announcement-cta-label"
            value={ctaLabel}
            onChange={(event) => setCtaLabel(event.target.value)}
            maxLength={40}
            disabled={isPending}
            placeholder="Read the update"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="announcement-cta-href">Link destination</Label>
          <Input
            id="announcement-cta-href"
            value={ctaHref}
            onChange={(event) => setCtaHref(event.target.value)}
            disabled={isPending}
            placeholder="/blog/platform-update"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="announcement-starts-at">Starts at</Label>
          <Input
            id="announcement-starts-at"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="announcement-ends-at">Ends at</Label>
          <Input
            id="announcement-ends-at"
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="announcement-priority">Priority</Label>
          <Input
            id="announcement-priority"
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            step={1}
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">Higher numbers appear first.</p>
        </div>
        <label className="flex min-h-9 items-center gap-3 self-end text-sm">
          <Checkbox checked={published} onCheckedChange={setPublished} disabled={isPending} />
          Publish now
        </label>
        {formError ? (
          <p className="text-xs text-destructive sm:col-span-2" role="alert">
            {formError}
          </p>
        ) : null}
      </form>
      <DialogFooter>
        <DialogClose
          render={
            <Button type="button" variant="ghost" disabled={isPending}>
              Cancel
            </Button>
          }
        />
        <Button type="submit" form="announcement-form" disabled={isPending}>
          {isEditing ? <Check /> : <Plus />}
          {isPending ? "Saving…" : isEditing ? "Save changes" : "Create announcement"}
        </Button>
      </DialogFooter>
    </>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-9 w-full border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {titleCase(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

function ChoiceGroup<T extends string>({
  legend,
  values,
  selected,
  disabled,
  onToggle,
}: {
  legend: string;
  values: readonly T[];
  selected: readonly T[];
  disabled: boolean;
  onToggle: (value: T) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="flex min-h-9 flex-wrap items-center gap-x-4 gap-y-2 border border-border/70 px-3 py-2">
        {values.map((value) => (
          <label key={value} className="flex items-center gap-2 text-xs capitalize">
            <Checkbox
              checked={selected.includes(value)}
              onCheckedChange={() => onToggle(value)}
              disabled={disabled}
            />
            {value}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function toggleValue<T>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}
