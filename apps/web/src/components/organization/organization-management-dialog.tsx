"use client";

import { Button } from "@better-convex-stack/ui/components/button";
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
import type * as React from "react";
import { useEffect, useState } from "react";

import { getErrorMessage, slugify } from "./organization-management-utils";
import type {
  Organization,
  OrganizationDialogState,
  OrganizationFormValues,
} from "./organization-management-types";

type OrganizationManagementDialogProps = {
  state: OrganizationDialogState | null;
  organization: Organization | undefined;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: OrganizationFormValues) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function OrganizationManagementDialog({
  state,
  organization,
  isSaving,
  onClose,
  onSave,
  onDelete,
}: OrganizationManagementDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugWasEdited, setSlugWasEdited] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setName(organization?.name ?? "");
    setSlug(organization?.slug ?? "");
    setSlugWasEdited(Boolean(organization));
    setFormError(null);
  }, [organization?.id, state?.mode]);

  if (!state) return null;

  const isDelete = state.mode === "delete";
  const isEditing = state.mode === "edit";

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const nextName = String(formData.get("name") ?? "").trim();
    const nextSlug = slugify(String(formData.get("slug") ?? ""));

    if (!nextName) {
      setFormError("Enter a name for this organization.");
      return;
    }
    if (!nextSlug) {
      setFormError("Add a URL-friendly slug for this organization.");
      return;
    }

    setFormError(null);
    try {
      await onSave({ name: nextName, slug: nextSlug });
    } catch (error) {
      setFormError(getErrorMessage(error, "The organization could not be saved."));
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose();
      }}
    >
      <DialogContent>
        {isDelete ? (
          <>
            <DialogHeader>
              <DialogTitle>Delete organization?</DialogTitle>
              <DialogDescription>
                {organization?.name ?? "This organization"} will be removed with its membership records.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose
                render={
                  <Button type="button" variant="ghost" disabled={isSaving}>
                    Keep organization
                  </Button>
                }
              />
              <Button
                type="button"
                variant="destructive"
                disabled={isSaving}
                onClick={() => void onDelete()}
              >
                {isSaving ? "Deleting…" : "Delete organization"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit organization" : "Create organization"}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the name or URL for this organization."
                  : "Create a workspace for your team."}
              </DialogDescription>
            </DialogHeader>
            <form
              id="organization-form"
              className="grid gap-4 px-5 pt-5 sm:px-6 sm:pt-6"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-2">
                <Label htmlFor="organization-name">Name</Label>
                <Input
                  id="organization-name"
                  name="name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (!isEditing && !slugWasEdited) setSlug(slugify(event.target.value));
                  }}
                  placeholder="Northstar"
                  autoComplete="organization"
                  disabled={isSaving}
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="organization-slug">URL slug</Label>
                <Input
                  id="organization-slug"
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlugWasEdited(true);
                    setSlug(slugify(event.target.value));
                  }}
                  placeholder="northstar"
                  autoCapitalize="none"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={isSaving}
                />
                <p className="text-[11px] text-muted-foreground">
                  Used in links like /home/northstar.
                </p>
              </div>
              {formError ? (
                <p className="text-xs text-destructive" role="alert">
                  {formError}
                </p>
              ) : null}
            </form>
            <DialogFooter>
              <DialogClose
                render={
                  <Button type="button" variant="ghost" disabled={isSaving}>
                    Cancel
                  </Button>
                }
              />
              <Button type="submit" form="organization-form" disabled={isSaving}>
                {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create organization"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
