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
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { ArrowUpRight, Building2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { OrganizationInviteForm } from "@/components/organization/organization-invite-form";
import { OrganizationInvitationList } from "@/components/organization/organization-invitation-list";
import { OrganizationMemberList } from "@/components/organization/organization-member-list";
import {
  getAuthErrorMessage,
  hasOrganizationRole,
  type OrganizationInvitationShare,
} from "@/components/organization/organization-member-types";
import { OrganizationInvitationShareDialog } from "@/components/organization/organization-invitation-share-dialog";
import { OrganizationResourcePage } from "@/components/organization/organization-resource-page";

export function OrganizationMembersView({ orgSlug }: { orgSlug: string }) {
  const organizationsQuery = authClient.useListOrganizations();
  const activeOrganizationQuery = authClient.useActiveOrganization();
  const activeMemberQuery = authClient.useActiveMember();
  const requestedOrganizationId = useRef<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const [pendingInvitationId, setPendingInvitationId] = useState<string | null>(null);
  const [invitationToShare, setInvitationToShare] = useState<OrganizationInvitationShare | null>(
    null,
  );

  const organization = organizationsQuery.data?.find((item) => item.slug === orgSlug);
  const activeOrganization =
    activeOrganizationQuery.data?.id === organization?.id ? activeOrganizationQuery.data : null;
  const activeRole = activeOrganization ? (activeMemberQuery.data?.role ?? "") : "";
  const canManageMembers =
    hasOrganizationRole(activeRole, "owner") || hasOrganizationRole(activeRole, "admin");
  const canSetOwner = hasOrganizationRole(activeRole, "owner");

  useEffect(() => {
    if (
      !organization ||
      activeOrganizationQuery.isPending ||
      activeOrganizationQuery.data?.id === organization.id ||
      requestedOrganizationId.current === organization.id
    ) {
      return;
    }

    requestedOrganizationId.current = organization.id;
    void authClient.organization
      .setActive({ organizationId: organization.id })
      .then(({ error }) => {
        if (error) setSyncError(error.message || "This workspace could not be selected.");
      });
  }, [activeOrganizationQuery.data?.id, activeOrganizationQuery.isPending, organization]);

  if (organizationsQuery.isPending) {
    return <OrganizationMembersLoading />;
  }

  if (organizationsQuery.error) {
    return (
      <section className="border border-destructive/30 bg-destructive/5 p-5" role="alert">
        <p className="text-sm font-medium">Members could not be loaded.</p>
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

  if (!organization) {
    return (
      <Empty className="min-h-96 border border-border/70 bg-background">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2 />
          </EmptyMedia>
          <EmptyTitle>Workspace not found</EmptyTitle>
          <EmptyDescription>
            This workspace is not connected to your account, or its URL has changed.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href="/home/organizations" />} nativeButton={false} size="sm">
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
          size="sm"
          className="mt-4"
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

  const members = activeOrganization?.members ?? [];
  const invitations = activeOrganization?.invitations ?? [];
  const organizationId = organization.id;

  async function handleRoleChange(memberId: string, role: string) {
    setPendingMemberId(memberId);

    try {
      const { error } = await authClient.organization.updateMemberRole({
        memberId,
        role,
        organizationId,
      });

      if (error) {
        throw new Error(getAuthErrorMessage(error, "The member role could not be updated."));
      }

      toast.success("Member role updated");
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "The member role could not be updated."));
    } finally {
      setPendingMemberId(null);
    }
  }

  async function handleCancelInvitation(invitationId: string) {
    setPendingInvitationId(invitationId);

    try {
      const { error } = await authClient.organization.cancelInvitation({ invitationId });

      if (error) {
        throw new Error(getAuthErrorMessage(error, "The invitation could not be canceled."));
      }

      toast.success("Invitation canceled");
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "The invitation could not be canceled."));
    } finally {
      setPendingInvitationId(null);
    }
  }

  return (
    <OrganizationResourcePage
      organization={{ name: organization.name, slug: orgSlug }}
      title="Members"
      description="Invite people and manage workspace roles."
      icon={Users}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border border-border/70 bg-background px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Workspace members
            </p>
            <h2 className="mt-1 text-sm font-medium">
              {members.length === 1 ? "1 member connected" : `${members.length} members connected`}
            </h2>
          </div>
          <Link
            href="/home/organizations"
            className="inline-flex h-8 items-center gap-1.5 border border-border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            Manage workspaces <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <OrganizationInviteForm
          organizationId={organization.id}
          canInvite={canManageMembers}
          canInviteOwner={canSetOwner}
          onInvitationCreated={setInvitationToShare}
        />

        <OrganizationInvitationShareDialog
          invitation={invitationToShare}
          onClose={() => setInvitationToShare(null)}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
          <OrganizationMemberList
            members={members}
            isLoading={
              activeOrganizationQuery.isPending ||
              activeMemberQuery.isPending ||
              !activeOrganization
            }
            canManageMembers={canManageMembers}
            canSetOwner={canSetOwner}
            pendingMemberId={pendingMemberId}
            onRoleChange={(memberId, role) => void handleRoleChange(memberId, role)}
          />
          <OrganizationInvitationList
            invitations={invitations}
            isLoading={activeOrganizationQuery.isPending || !activeOrganization}
            canCancel={canManageMembers}
            pendingInvitationId={pendingInvitationId}
            onCancel={(invitationId) => void handleCancelInvitation(invitationId)}
          />
        </div>
      </div>
    </OrganizationResourcePage>
  );
}

function OrganizationMembersLoading() {
  return (
    <div className="space-y-8" aria-label="Loading organization members">
      <section className="space-y-3 border-b border-border/70 pb-8">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-[30rem] max-w-full" />
      </section>
      <Skeleton className="h-24" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
