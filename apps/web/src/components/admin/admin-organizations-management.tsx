"use client";

import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { Button } from "@better-convex-stack/ui/components/button";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminOrganizationDialog } from "./admin-organization-dialog";
import { AdminOrganizationDirectory } from "./admin-organization-directory";
import { AdminOrganizationRoster } from "./admin-organization-roster";
import {
  getErrorMessage,
  type AddMemberFormValues,
  type AdminUser,
  type OrganizationDialogState,
  type OrganizationFormValues,
  type OrganizationMember,
  type OrganizationRole,
  type OrganizationSummary,
} from "./admin-management-utils";
import { authClient } from "@/lib/auth-client";

export function AdminOrganizationsManagement() {
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<OrganizationDialogState | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const organizations = useQuery(api.admin.listOrganizations, { limit: 100 }) as
    | OrganizationSummary[]
    | undefined;
  const memberQueryArgs = selectedOrganizationId
    ? { limit: 100, organizationId: selectedOrganizationId }
    : "skip";
  const members = useQuery(api.admin.listMembers, memberQueryArgs) as
    | OrganizationMember[]
    | undefined;
  const createOrganization = useMutation(api.admin.createOrganization);
  const updateOrganization = useMutation(api.admin.updateOrganization);
  const deleteOrganization = useMutation(api.admin.deleteOrganization);
  const addMember = useMutation(api.admin.addMember);
  const updateMemberRole = useMutation(api.admin.updateMemberRole);
  const deleteMember = useMutation(api.admin.deleteMember);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const result = await authClient.admin.listUsers({
        query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
      });
      if (result.error) {
        throw new Error(getErrorMessage(result.error, "Members could not be loaded."));
      }
      setUsers(result.data?.users ?? []);
    } catch (error) {
      setUsersError(getErrorMessage(error, "Members could not be loaded."));
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!organizations?.length) {
      setSelectedOrganizationId(null);
      return;
    }
    if (
      !selectedOrganizationId ||
      !organizations.some((organization) => organization.id === selectedOrganizationId)
    ) {
      setSelectedOrganizationId(organizations[0].id);
    }
  }, [organizations, selectedOrganizationId]);

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const selectedOrganization = organizations?.find(
    (organization) => organization.id === selectedOrganizationId,
  );
  const selectedMembers = members?.filter(
    (member) => member.organizationId === selectedOrganizationId,
  );
  const dialogOrganization =
    dialog && "organizationId" in dialog
      ? organizations?.find((organization) => organization.id === dialog.organizationId)
      : undefined;
  const dialogMember =
    dialog?.mode === "delete-member"
      ? selectedMembers?.find((member) => member.id === dialog.memberId)
      : undefined;

  async function handleSaveOrganization(values: OrganizationFormValues) {
    if (!dialog || (dialog.mode !== "create" && dialog.mode !== "edit")) return;

    setPendingAction("organization-form");
    try {
      if (dialog.mode === "edit") {
        await updateOrganization({
          organizationId: dialog.organizationId,
          name: values.name,
          slug: values.slug,
        });
        toast.success("Organization updated");
      } else {
        await createOrganization({
          name: values.name,
          slug: values.slug,
          ownerUserId: values.ownerUserId,
        });
        toast.success("Organization created");
      }
      setDialog(null);
    } catch (error) {
      throw new Error(getErrorMessage(error, "The organization could not be saved."));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleAddMember(values: AddMemberFormValues) {
    if (!selectedOrganizationId) return;

    setPendingAction("member-add");
    try {
      await addMember({
        organizationId: selectedOrganizationId,
        userId: values.userId,
        role: values.role,
      });
      toast.success("Member added");
      setDialog(null);
    } catch (error) {
      throw new Error(getErrorMessage(error, "The member could not be added."));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDeleteOrganization() {
    if (!dialog || dialog.mode !== "delete-organization") return;

    setPendingAction(dialog.organizationId);
    try {
      await deleteOrganization({ organizationId: dialog.organizationId });
      toast.success("Organization deleted");
      setDialog(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "The organization could not be deleted."));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleMemberRoleChange(member: OrganizationMember, role: OrganizationRole) {
    if (role === member.role) return;
    setPendingAction(member.id);
    try {
      await updateMemberRole({ memberId: member.id, role });
      toast.success("Member role updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "The member role could not be updated."));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDeleteMember() {
    if (!dialog || dialog.mode !== "delete-member") return;

    setPendingAction(dialog.memberId);
    try {
      await deleteMember({ memberId: dialog.memberId });
      toast.success("Member removed");
      setDialog(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "The member could not be removed."));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Administration / workspaces
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em]">Organizations</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Create organizations and manage their members from one place.
          </p>
        </div>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => setDialog({ mode: "create" })}
          disabled={users.length === 0}
        >
          <Plus />
          New organization
        </Button>
      </section>

      {usersError ? (
        <section className="border border-destructive/30 bg-destructive/5 p-5 text-sm">
          <p className="font-medium">Member directory unavailable</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {usersError} Create an owner in the Members area first.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void loadUsers()}
          >
            Try again
          </Button>
        </section>
      ) : usersLoading ? (
        <Skeleton className="h-12 w-full" />
      ) : users.length === 0 ? (
        <section className="border border-amber-500/30 bg-amber-500/5 p-5 text-sm">
          <p className="font-medium">Create a member before creating an organization</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Every organization needs a first owner. Add that member in the Members area, then return
            here.
          </p>
          <Link
            href="/admin/users"
            className="mt-4 inline-flex h-7 items-center border border-border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            Open members
          </Link>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <AdminOrganizationDirectory
          organizations={organizations}
          usersById={usersById}
          selectedOrganizationId={selectedOrganizationId}
          onSelect={setSelectedOrganizationId}
          onEdit={(organization) => setDialog({ mode: "edit", organizationId: organization.id })}
          onDelete={(organization) =>
            setDialog({ mode: "delete-organization", organizationId: organization.id })
          }
        />
        <AdminOrganizationRoster
          organization={selectedOrganization}
          members={selectedMembers}
          usersById={usersById}
          pendingAction={pendingAction}
          onAddMember={() => setDialog({ mode: "add-member" })}
          onRoleChange={(member, role) => void handleMemberRoleChange(member, role)}
          onRemoveMember={(member) => setDialog({ mode: "delete-member", memberId: member.id })}
        />
      </div>

      <AdminOrganizationDialog
        state={dialog}
        organization={dialogOrganization}
        member={dialogMember}
        selectedOrganizationName={selectedOrganization?.name ?? "this organization"}
        users={users}
        memberUsersById={usersById}
        pendingAction={pendingAction}
        onClose={() => setDialog(null)}
        onSaveOrganization={handleSaveOrganization}
        onAddMember={handleAddMember}
        onDeleteOrganization={handleDeleteOrganization}
        onDeleteMember={handleDeleteMember}
      />
    </div>
  );
}
