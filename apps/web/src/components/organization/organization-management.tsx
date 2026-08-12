"use client";

import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { Button } from "@better-convex-stack/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@better-convex-stack/ui/components/empty";
import { useQuery } from "convex/react";
import { Building2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { OrganizationManagementDialog } from "./organization-management-dialog";
import { OrganizationManagementLoading } from "./organization-management-loading";
import { getErrorMessage } from "./organization-management-utils";
import type {
  OrganizationDialogState,
  OrganizationFormValues,
} from "./organization-management-types";
import { OrganizationRow } from "./organization-row";

export function OrganizationManagement() {
  const organizationsQuery = authClient.useListOrganizations();
  const activeOrganizationQuery = authClient.useActiveOrganization();
  const organizations = organizationsQuery.data ?? [];
  const organizationsMembers = useQuery(
    api.organizations.getMyOrganizationsMembers,
    organizations.length > 0 ? {} : "skip",
  );
  const membersByOrganizationId = new Map(
    organizationsMembers?.map((summary) => [summary.organizationId, summary]) ?? [],
  );
  const [dialog, setDialog] = useState<OrganizationDialogState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const dialogOrganization =
    dialog && "organizationId" in dialog
      ? organizations.find(({ id }) => id === dialog.organizationId)
      : undefined;

  async function handleSave(values: OrganizationFormValues) {
    if (!dialog || (dialog.mode !== "create" && dialog.mode !== "edit")) return;

    setIsSaving(true);
    try {
      if (dialog.mode === "edit") {
        const { error } = await authClient.organization.update({
          organizationId: dialog.organizationId,
          data: values,
        });

        if (error) {
          throw new Error(getErrorMessage(error, "The organization could not be updated."));
        }

        toast.success("Organization updated");
      } else {
        const { error } = await authClient.organization.create(values);

        if (error) {
          throw new Error(getErrorMessage(error, "The organization could not be created."));
        }

        toast.success("Organization created");
      }

      setDialog(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!dialog || dialog.mode !== "delete") return;

    const organization = organizations.find(({ id }) => id === dialog.organizationId);
    if (!organization) return;

    setIsSaving(true);
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

      setDialog(null);
      toast.success("Organization deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "The organization could not be deleted."));
      setDialog(null);
    } finally {
      setIsSaving(false);
    }
  }

  if (organizationsQuery.isPending) {
    return <OrganizationManagementLoading />;
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
      <section
        className="border border-border/70 bg-background"
        aria-labelledby="organization-list-title"
      >
        <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Organizations
            </p>
            <h2 id="organization-list-title" className="mt-1 text-sm font-medium">
              {organizations.length === 1
                ? "1 organization connected"
                : `${organizations.length} organizations connected`}
            </h2>
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full gap-2 sm:w-auto"
            onClick={() => setDialog({ mode: "create" })}
          >
            <Plus className="size-3.5" />
            New organization
          </Button>
        </div>

        {organizations.length ? (
          <div>
            {organizations.map((organization) => (
              <OrganizationRow
                key={organization.id}
                organization={organization}
                isActive={activeOrganizationQuery.data?.id === organization.id}
                membersSummary={membersByOrganizationId.get(organization.id)}
                isLoadingMembers={organizationsMembers === undefined}
                onEdit={(target) => setDialog({ mode: "edit", organizationId: target.id })}
                onDelete={(target) => setDialog({ mode: "delete", organizationId: target.id })}
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
              <Button
                type="button"
                size="sm"
                className="gap-2"
                onClick={() => setDialog({ mode: "create" })}
              >
                <Plus className="size-3.5" />
                New organization
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </section>

      <OrganizationManagementDialog
        state={dialog}
        organization={dialogOrganization}
        isSaving={isSaving}
        onClose={() => setDialog(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
