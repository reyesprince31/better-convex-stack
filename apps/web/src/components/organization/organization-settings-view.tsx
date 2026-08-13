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
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { useMutation } from "convex/react";
import { Building2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { SettingsTabs, type SettingsTab } from "@/components/shared/settings-ui";
import { authClient } from "@/lib/auth-client";

import { OrganizationManagementDialog } from "./organization-management-dialog";
import type { OrganizationFormValues } from "./organization-management-types";
import { getErrorMessage } from "./organization-management-utils";
import { formatOrganizationRole, hasOrganizationRole } from "./organization-member-types";
import { OrganizationResourcePage } from "./organization-resource-page";
import {
  OrganizationAdvancedPanel,
  OrganizationBillingPanel,
  OrganizationGeneralPanel,
  OrganizationNotificationsPanel,
} from "./organization-settings-panels";
import {
  defaultOrganizationNotifications,
  getOrganizationNotificationStorageKey,
  isOrganizationSettingsTab,
  organizationSettingsTabs,
  type OrganizationNotificationId,
  type OrganizationNotificationSettings,
  type OrganizationSettingsTab,
} from "./organization-settings-data";

function loadNotifications(organizationId: string) {
  try {
    const stored = window.localStorage.getItem(
      getOrganizationNotificationStorageKey(organizationId),
    );
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<OrganizationNotificationSettings>;
    return {
      "member-changes":
        typeof parsed["member-changes"] === "boolean"
          ? parsed["member-changes"]
          : defaultOrganizationNotifications["member-changes"],
      "billing-events": true,
      "project-digest":
        typeof parsed["project-digest"] === "boolean"
          ? parsed["project-digest"]
          : defaultOrganizationNotifications["project-digest"],
    } satisfies OrganizationNotificationSettings;
  } catch {
    return null;
  }
}

export function OrganizationSettingsView({ orgSlug, plan }: { orgSlug: string; plan: string }) {
  const organizationsQuery = authClient.useListOrganizations();
  const activeOrganizationQuery = authClient.useActiveOrganization();
  const activeMemberQuery = authClient.useActiveMember();
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedOrganizationId = useRef<string | null>(null);
  const deletingOrganizationId = useRef<string | null>(null);
  const deleteOwnedOrganization = useMutation(api.organizations.deleteOwnedOrganization);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<"edit" | "delete" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState<OrganizationNotificationSettings>(
    defaultOrganizationNotifications,
  );

  const organization = organizationsQuery.data?.find((item) => item.slug === orgSlug);
  const activeOrganization =
    activeOrganizationQuery.data?.id === organization?.id ? activeOrganizationQuery.data : null;
  const activeRole = activeOrganization ? (activeMemberQuery.data?.role ?? "") : "";
  const canManage =
    hasOrganizationRole(activeRole, "owner") || hasOrganizationRole(activeRole, "admin");
  const canDelete = hasOrganizationRole(activeRole, "owner");
  const requestedTab = searchParams.get("tab") ?? searchParams.get("section");
  const activeTab: OrganizationSettingsTab = isOrganizationSettingsTab(requestedTab)
    ? requestedTab
    : "general";

  useEffect(() => {
    if (
      !organization ||
      activeOrganizationQuery.isPending ||
      activeOrganizationQuery.data?.id === organization.id ||
      deletingOrganizationId.current === organization.id ||
      requestedOrganizationId.current === organization.id
    ) {
      return;
    }

    requestedOrganizationId.current = organization.id;
    void authClient.organization
      .setActive({ organizationId: organization.id })
      .then(({ error }) => {
        if (error) setSyncError(error.message || "This workspace could not be selected.");
      })
      .catch((error: unknown) => {
        setSyncError(getErrorMessage(error, "This workspace could not be selected."));
      })
      .finally(() => {
        if (requestedOrganizationId.current === organization.id) {
          requestedOrganizationId.current = null;
        }
      });
  }, [activeOrganizationQuery.data?.id, activeOrganizationQuery.isPending, organization]);

  useEffect(() => {
    if (!organization) return;
    const stored = loadNotifications(organization.id);
    setNotifications(stored ?? defaultOrganizationNotifications);
  }, [organization?.id]);

  if (organizationsQuery.isPending) return <OrganizationSettingsLoading />;

  if (organizationsQuery.error) {
    return (
      <section className="border border-destructive/30 bg-destructive/5 p-5" role="alert">
        <p className="text-sm font-medium">Workspace settings could not be loaded.</p>
        <p className="mt-1 text-xs text-muted-foreground">{organizationsQuery.error.message}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 rounded-lg"
          onClick={() => void organizationsQuery.refetch()}
        >
          Try again
        </Button>
      </section>
    );
  }

  if (!organization) {
    return (
      <Empty className="min-h-96 border border-border/70 bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="rounded-none">
            <Building2 />
          </EmptyMedia>
          <EmptyTitle>Workspace not found</EmptyTitle>
          <EmptyDescription>
            This workspace is not connected to your account, or its URL has changed.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button className="rounded-lg" render={<Link href="/home/organizations" />}>
            Manage organizations
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (syncError) {
    return (
      <section className="border border-destructive/30 bg-destructive/5 p-5" role="alert">
        <p className="text-sm font-medium">This workspace could not be selected.</p>
        <p className="mt-1 text-xs text-muted-foreground">{syncError}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 rounded-lg"
          onClick={() => {
            requestedOrganizationId.current = null;
            setSyncError(null);
          }}
        >
          Try again
        </Button>
      </section>
    );
  }

  if (!activeOrganization || activeMemberQuery.isPending) return <OrganizationSettingsLoading />;

  const tabs: ReadonlyArray<SettingsTab<OrganizationSettingsTab>> = organizationSettingsTabs.map(
    (tab) => ({
      ...tab,
      href: (tab.id === "general"
        ? `/home/${orgSlug}/settings`
        : `/home/${orgSlug}/settings?tab=${tab.id}`) as Route,
    }),
  );
  const organizationId = organization.id;
  const memberCount = activeOrganization.members.length;
  const formattedRole = formatOrganizationRole(activeRole) || "Member";

  async function saveOrganization(values: OrganizationFormValues) {
    setIsSaving(true);
    try {
      const { error } = await authClient.organization.update({
        organizationId,
        data: values,
      });
      if (error) throw new Error(getErrorMessage(error, "The workspace could not be updated."));

      setDialogMode(null);
      toast.success("Workspace updated");
      if (values.slug !== orgSlug) {
        router.replace(`/home/${values.slug}/settings` as Route);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteOrganization() {
    if (!canDelete) return;

    deletingOrganizationId.current = organizationId;
    setIsSaving(true);
    try {
      const clearResult = await authClient.organization.setActive({ organizationId: null });
      if (clearResult.error) {
        throw new Error(
          getErrorMessage(clearResult.error, "The active organization could not be cleared."),
        );
      }

      await deleteOwnedOrganization({ organizationId });

      setDialogMode(null);
      toast.success("Organization deleted");
      router.replace("/home/organizations");
    } catch (error) {
      toast.error(getErrorMessage(error, "The organization could not be deleted."));
    } finally {
      deletingOrganizationId.current = null;
      setIsSaving(false);
    }
  }

  function toggleNotification(id: OrganizationNotificationId, checked: boolean) {
    if (id === "billing-events") return;
    setNotifications((current) => ({ ...current, [id]: checked }));
  }

  function saveNotifications() {
    window.localStorage.setItem(
      getOrganizationNotificationStorageKey(organizationId),
      JSON.stringify(notifications),
    );
    toast.success("Workspace notifications saved to this browser");
  }

  function showMockAction(label: string) {
    toast.info(`${label} is UI-ready. Connect the matching provider to enable it.`);
  }

  return (
    <OrganizationResourcePage
      organization={{ name: organization.name, slug: orgSlug }}
      title="Settings"
      description="Manage the workspace details that follow your team from project to project."
      icon={Building2}
    >
      <div className="space-y-5">
        <SettingsTabs tabs={tabs} activeTab={activeTab} label="Workspace settings" />

        {activeTab === "general" ? (
          <OrganizationGeneralPanel
            name={organization.name}
            slug={orgSlug}
            memberCount={memberCount}
            role={formattedRole}
            canManage={canManage}
            onEdit={() => setDialogMode("edit")}
          />
        ) : null}
        {activeTab === "billing" ? (
          <OrganizationBillingPanel
            plan={plan}
            memberCount={memberCount}
            canManage={canManage}
            onMockAction={showMockAction}
          />
        ) : null}
        {activeTab === "notifications" ? (
          <OrganizationNotificationsPanel
            settings={notifications}
            canManage={canManage}
            onToggle={toggleNotification}
            onSave={saveNotifications}
          />
        ) : null}
        {activeTab === "advanced" ? (
          <OrganizationAdvancedPanel
            slug={orgSlug}
            canManage={canManage}
            canDelete={canDelete}
            onMockAction={showMockAction}
            onDelete={() => setDialogMode("delete")}
          />
        ) : null}
      </div>

      <OrganizationManagementDialog
        state={dialogMode ? { mode: dialogMode, organizationId: organization.id } : null}
        organization={organization}
        isSaving={isSaving}
        onClose={() => setDialogMode(null)}
        onSave={saveOrganization}
        onDelete={deleteOrganization}
      />
    </OrganizationResourcePage>
  );
}

export function OrganizationSettingsLoading() {
  return (
    <div className="space-y-5" aria-label="Loading workspace settings">
      <section className="border-b border-border/70 pb-6">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="mt-3 h-9 w-64 max-w-full" />
        <Skeleton className="mt-3 h-4 w-120 max-w-full" />
      </section>
      <Skeleton className="h-12" />
      <Skeleton className="h-72" />
    </div>
  );
}
