"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@better-convex-stack/ui/components/empty";
import { Input } from "@better-convex-stack/ui/components/input";
import { Label } from "@better-convex-stack/ui/components/label";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@better-convex-stack/ui/components/dropdown-menu";
import { Building2, Check, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

type Organization = NonNullable<ReturnType<typeof authClient.useListOrganizations>["data"]>[number];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function getErrorMessage(error: { message?: string } | null | undefined, fallback: string) {
  return error?.message || fallback;
}

function OrganizationMark({ name }: { name: string }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center bg-foreground text-background">
      <span className="font-mono text-[11px] font-semibold tracking-[-0.12em]">
        {name.slice(0, 2).toLowerCase()}
      </span>
    </span>
  );
}

function OrganizationRow({
  organization,
  isActive,
  isDeleting,
  onEdit,
  onDelete,
  onCancelDelete,
}: {
  organization: Organization;
  isActive: boolean;
  isDeleting: boolean;
  onEdit: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
  onCancelDelete: () => void;
}) {
  if (isDeleting) {
    return (
      <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center bg-destructive/10 text-destructive">
            <Trash2 className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium">Delete {organization.name}?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This removes the workspace and its membership records.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <Button type="button" variant="ghost" size="sm" onClick={onCancelDelete}>
            Keep it
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(organization)}
          >
            Delete workspace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col gap-4 border-b border-border/70 px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <OrganizationMark name={organization.name} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/home/${organization.slug}`}
              className="truncate text-sm font-medium transition-colors hover:text-primary"
            >
              {organization.name}
            </Link>
            {isActive ? (
              <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[9px] tracking-[0.12em] text-emerald-600 uppercase dark:text-emerald-400">
                <Check className="size-3" /> Active
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
            /{organization.slug}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:shrink-0 sm:justify-end">
        <p className="text-xs text-muted-foreground">
          Created{" "}
          {new Date(organization.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${organization.name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => onEdit(organization)}>
              <Pencil />
              Edit details
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(organization)}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function OrganizationManagement() {
  const organizationsQuery = authClient.useListOrganizations();
  const activeOrganizationQuery = authClient.useActiveOrganization();
  const organizations = organizationsQuery.data ?? [];
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrganizationId, setEditingOrganizationId] = useState<string | null>(null);
  const [deletingOrganizationId, setDeletingOrganizationId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugWasEdited, setSlugWasEdited] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const editingOrganization = organizations.find(({ id }) => id === editingOrganizationId);

  function openCreateForm() {
    setEditingOrganizationId(null);
    setDeletingOrganizationId(null);
    setName("");
    setSlug("");
    setSlugWasEdited(false);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(organization: Organization) {
    setEditingOrganizationId(organization.id);
    setDeletingOrganizationId(null);
    setName(organization.name);
    setSlug(organization.slug);
    setSlugWasEdited(true);
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSaving) return;
    setIsFormOpen(false);
    setFormError(null);
  }

  async function handleSubmit(event: React.SubmitEvent) {
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

    setIsSaving(true);
    setFormError(null);

    try {
      if (editingOrganizationId) {
        const { error } = await authClient.organization.update({
          organizationId: editingOrganizationId,
          data: { name: nextName, slug: nextSlug },
        });

        if (error) {
          throw new Error(getErrorMessage(error, "The organization could not be updated."));
        }

        toast.success("Organization updated");
      } else {
        const { error } = await authClient.organization.create({ name: nextName, slug: nextSlug });

        if (error) {
          throw new Error(getErrorMessage(error, "The organization could not be created."));
        }

        toast.success("Organization created");
      }

      setIsFormOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(organization: Organization) {
    setIsSaving(true);
    setFormError(null);

    try {
      if (activeOrganizationQuery.data?.id === organization.id) {
        const { error } = await authClient.organization.setActive({ organizationId: null });

        if (error) {
          throw new Error(getErrorMessage(error, "The active organization could not be cleared."));
        }
      }

      const { error } = await authClient.organization.delete({ organizationId: organization.id });

      if (error) {
        throw new Error(getErrorMessage(error, "The organization could not be deleted."));
      }

      setDeletingOrganizationId(null);
      toast.success("Organization deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      toast.error(message);
      setDeletingOrganizationId(null);
    } finally {
      setIsSaving(false);
    }
  }

  if (organizationsQuery.isPending) {
    return (
      <section className="border border-border/70 bg-background" aria-label="Loading organizations">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="space-y-4 p-5">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </section>
    );
  }

  if (organizationsQuery.error) {
    return (
      <section className="border border-destructive/30 bg-destructive/5 p-5" role="alert">
        <p className="text-sm font-medium">Organizations could not be loaded.</p>
        <p className="mt-1 text-xs text-muted-foreground">{organizationsQuery.error.message}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => void organizationsQuery.refetch()}
        >
          Try again
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {isFormOpen ? (
        <section
          className="border border-border/70 bg-background"
          aria-labelledby="organization-form-title"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                {editingOrganization ? "Edit organization" : "New organization"}
              </p>
              <h2 id="organization-form-title" className="mt-1 text-sm font-medium">
                {editingOrganization
                  ? "Update workspace details"
                  : "Create a workspace for your team"}
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close form"
              onClick={closeForm}
            >
              <X className="size-4" />
            </Button>
          </div>
          <form
            className="grid gap-4 p-5 md:grid-cols-[1fr_0.7fr_auto] md:items-end"
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
                  if (!editingOrganization && !slugWasEdited) setSlug(slugify(event.target.value));
                }}
                placeholder="e.g. Northstar"
                autoComplete="organization"
                disabled={isSaving}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="organization-slug">Slug</Label>
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
            </div>
            <Button type="submit" className="h-8 gap-2" disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : editingOrganization
                  ? "Save changes"
                  : "Create organization"}
            </Button>
            {formError ? (
              <p className="text-xs text-destructive md:col-span-full" role="alert">
                {formError}
              </p>
            ) : null}
          </form>
        </section>
      ) : null}

      <section
        className="border border-border/70 bg-background"
        aria-labelledby="organization-list-title"
      >
        <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Your workspaces
            </p>
            <h2 id="organization-list-title" className="mt-1 text-sm font-medium">
              {organizations.length === 1
                ? "One organization connected"
                : `${organizations.length} organizations connected`}
            </h2>
          </div>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={openCreateForm}
            disabled={isFormOpen}
          >
            <Plus className="size-3.5" />
            Add organization
          </Button>
        </div>

        {organizations.length ? (
          <div>
            {organizations.map((organization) => (
              <OrganizationRow
                key={organization.id}
                organization={organization}
                isActive={activeOrganizationQuery.data?.id === organization.id}
                isDeleting={deletingOrganizationId === organization.id}
                onEdit={openEditForm}
                onDelete={(target) => {
                  if (deletingOrganizationId === target.id) void handleDelete(target);
                  else setDeletingOrganizationId(target.id);
                }}
                onCancelDelete={() => setDeletingOrganizationId(null)}
              />
            ))}
          </div>
        ) : (
          <Empty className="min-h-64 border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2 />
              </EmptyMedia>
              <EmptyTitle>No organizations yet</EmptyTitle>
              <EmptyDescription>
                Create your first workspace to start sharing projects and inviting teammates.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" size="sm" className="gap-2" onClick={openCreateForm}>
                <Plus className="size-3.5" />
                Create organization
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </section>
    </div>
  );
}
