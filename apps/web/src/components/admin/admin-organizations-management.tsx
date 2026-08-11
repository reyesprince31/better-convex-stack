"use client";

import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { Button } from "@better-convex-stack/ui/components/button";
import { Input } from "@better-convex-stack/ui/components/input";
import { Label } from "@better-convex-stack/ui/components/label";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { useMutation, useQuery } from "convex/react";
import { Building2, Check, ChevronRight, Plus, Trash2, Users, X } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

type ListUsersResponse = Awaited<ReturnType<typeof authClient.admin.listUsers>>;
type AdminUser = NonNullable<ListUsersResponse["data"]>["users"][number];
type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  createdAt: number;
  memberCount: number;
  ownerUserId: string | null;
};
type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: number;
};
type OrganizationRole = "owner" | "admin" | "member";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

function formatDate(value: Date | number | string) {
  return new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function userLabel(user: AdminUser | undefined) {
  return user ? `${user.name} / ${user.email}` : "Unknown member";
}

export function AdminOrganizationsManagement() {
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrganizationId, setEditingOrganizationId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [ownerUserId, setOwnerUserId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState<OrganizationRole>("member");
  const [confirmMemberId, setConfirmMemberId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const result = await authClient.admin.listUsers({
        query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
      });
      if (result.error)
        throw new Error(getErrorMessage(result.error, "Members could not be loaded."));
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
  const selectedMembers =
    members?.filter((member) => member.organizationId === selectedOrganizationId) ?? [];

  function openCreateForm() {
    setEditingOrganizationId(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setOwnerUserId(users[0]?.id ?? "");
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(organization: OrganizationSummary) {
    setEditingOrganizationId(organization.id);
    setName(organization.name);
    setSlug(organization.slug);
    setSlugTouched(true);
    setOwnerUserId(organization.ownerUserId ?? "");
    setFormError(null);
    setIsFormOpen(true);
    setConfirmDeleteId(null);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingOrganizationId(null);
    setFormError(null);
  }

  async function handleOrganizationSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const nextName = String(formData.get("name") ?? "").trim();
    const nextSlug = String(formData.get("slug") ?? "").trim();
    const nextOwnerUserId = String(formData.get("ownerUserId") ?? "");

    if (!nextName) {
      setFormError("Enter an organization name.");
      return;
    }
    if (!nextSlug) {
      setFormError("Enter a unique URL slug.");
      return;
    }
    if (!editingOrganizationId && !nextOwnerUserId) {
      setFormError("Select the first owner before creating the organization.");
      return;
    }

    setPendingAction("organization-form");
    setFormError(null);
    try {
      if (editingOrganizationId) {
        await updateOrganization({
          organizationId: editingOrganizationId,
          name: nextName,
          slug: nextSlug,
        });
        toast.success("Organization updated");
      } else {
        await createOrganization({ name: nextName, slug: nextSlug, ownerUserId: nextOwnerUserId });
        toast.success("Organization created");
      }
      closeForm();
    } catch (error) {
      setFormError(getErrorMessage(error, "The organization could not be saved."));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDeleteOrganization(organization: OrganizationSummary) {
    setPendingAction(organization.id);
    try {
      await deleteOrganization({ organizationId: organization.id });
      toast.success("Organization deleted");
      setConfirmDeleteId(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "The organization could not be deleted."));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleAddMember(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOrganizationId || !memberUserId) return;
    setPendingAction("member-add");
    try {
      await addMember({
        organizationId: selectedOrganizationId,
        userId: memberUserId,
        role: memberRole,
      });
      toast.success("Member added");
      setMemberUserId("");
      setMemberRole("member");
    } catch (error) {
      toast.error(getErrorMessage(error, "The member could not be added."));
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

  async function handleDeleteMember(member: OrganizationMember) {
    setPendingAction(member.id);
    try {
      await deleteMember({ memberId: member.id });
      toast.success("Member removed");
      setConfirmMemberId(null);
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
            Create a workspace for a provisioned member, then manage its roster from one place.
          </p>
        </div>
        <Button type="button" onClick={openCreateForm} disabled={users.length === 0}>
          <Plus />
          Create organization
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
            Every organization needs a first owner. Provision that user in the Members area, then
            return here.
          </p>
          <Link
            href="/admin/users"
            className="mt-4 inline-flex h-7 items-center border border-border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            Open members
          </Link>
        </section>
      ) : null}

      {isFormOpen ? (
        <section
          className="border border-border/70 bg-background p-5 sm:p-6"
          aria-labelledby="organization-form-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                {editingOrganizationId ? "Update record" : "Create record"}
              </p>
              <h2 id="organization-form-title" className="mt-2 text-lg font-medium">
                {editingOrganizationId ? "Edit organization" : "Create an organization"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                The owner is selected at creation time and can be changed later from the roster.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={closeForm}
              aria-label="Close organization form"
            >
              <X />
            </Button>
          </div>
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleOrganizationSubmit}>
            <div className="space-y-2">
              <Label htmlFor="admin-organization-name">Name</Label>
              <Input
                id="admin-organization-name"
                name="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (!slugTouched) setSlug(slugify(event.target.value));
                }}
                autoComplete="organization"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-organization-slug">URL slug</Label>
              <Input
                id="admin-organization-slug"
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlug(event.target.value);
                  setSlugTouched(true);
                }}
              />
            </div>
            {!editingOrganizationId ? (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="admin-organization-owner">First owner</Label>
                <select
                  id="admin-organization-owner"
                  name="ownerUserId"
                  value={ownerUserId}
                  onChange={(event) => setOwnerUserId(event.target.value)}
                  className="h-8 w-full border border-input bg-transparent px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                >
                  <option value="">Select a member</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {userLabel(user)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {formError ? (
              <p className="text-xs text-destructive md:col-span-2">{formError}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 md:col-span-2">
              <Button type="submit" disabled={pendingAction !== null}>
                <Check />
                {pendingAction === "organization-form"
                  ? "Saving..."
                  : editingOrganizationId
                    ? "Save organization"
                    : "Create organization"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={closeForm}
                disabled={pendingAction !== null}
              >
                Cancel
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <section
          className="border border-border/70 bg-background"
          aria-labelledby="organization-list-title"
        >
          <div className="border-b border-border/70 p-5 sm:p-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Workspace directory
            </p>
            <h2 id="organization-list-title" className="mt-2 text-lg font-medium">
              {organizations
                ? `${organizations.length} organization${organizations.length === 1 ? "" : "s"}`
                : "Loading organizations"}
            </h2>
          </div>
          {organizations === undefined ? (
            <div className="space-y-px p-5">
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} className="h-24 w-full" />
              ))}
            </div>
          ) : organizations.length === 0 ? (
            <div className="p-10 text-center">
              <Building2 className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No organizations yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use the create action above after provisioning the first owner.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {organizations.map((organization) => {
                const isSelected = organization.id === selectedOrganizationId;
                const isDeleting = confirmDeleteId === organization.id;
                const owner = usersById.get(organization.ownerUserId ?? "");
                return (
                  <div
                    key={organization.id}
                    className={`p-5 sm:p-6 ${isSelected ? "bg-muted/30" : ""}`}
                  >
                    {isDeleting ? (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center bg-destructive/10 text-destructive">
                            <Trash2 className="size-4" />
                          </span>
                          <div>
                            <p className="text-sm font-medium">Delete {organization.name}?</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Members and invitations in this workspace will be removed.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={pendingAction === organization.id}
                          >
                            Keep
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => void handleDeleteOrganization(organization)}
                            disabled={pendingAction === organization.id}
                          >
                            {pendingAction === organization.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          className="min-w-0 text-left"
                          onClick={() => setSelectedOrganizationId(organization.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center border border-border bg-muted/40">
                              <Building2 className="size-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">
                                {organization.name}
                              </span>
                              <span className="mt-1 block truncate font-mono text-[10px] text-muted-foreground">
                                /{organization.slug}
                              </span>
                            </span>
                          </div>
                        </button>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <span className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
                            {organization.memberCount} member
                            {organization.memberCount === 1 ? "" : "s"}
                          </span>
                          <span className="hidden text-xs text-muted-foreground lg:inline">
                            Owner: {owner?.name ?? "Unknown"}
                          </span>
                          <Button
                            type="button"
                            variant={isSelected ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setSelectedOrganizationId(organization.id)}
                          >
                            Manage <ChevronRight />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditForm(organization)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDeleteId(organization.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="border border-border/70 bg-background" aria-labelledby="roster-title">
          <div className="border-b border-border/70 p-5 sm:p-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Organization roster
            </p>
            <h2 id="roster-title" className="mt-2 text-lg font-medium">
              {selectedOrganization?.name ?? "Select an organization"}
            </h2>
            {selectedOrganization ? (
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                /{selectedOrganization.slug}
              </p>
            ) : null}
          </div>
          {!selectedOrganization ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Select a workspace to manage its members.
            </div>
          ) : (
            <>
              <form className="border-b border-border/70 p-5 sm:p-6" onSubmit={handleAddMember}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="size-4" /> Add member
                </div>
                <div className="mt-4 space-y-3">
                  <select
                    value={memberUserId}
                    onChange={(event) => setMemberUserId(event.target.value)}
                    className="h-8 w-full border border-input bg-transparent px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                  >
                    <option value="">Select a provisioned member</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {userLabel(user)}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <select
                      value={memberRole}
                      onChange={(event) => setMemberRole(event.target.value as OrganizationRole)}
                      className="h-8 min-w-0 flex-1 border border-input bg-transparent px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!memberUserId || pendingAction !== null}
                    >
                      <Plus />
                      Add
                    </Button>
                  </div>
                </div>
              </form>
              {members === undefined ? (
                <div className="space-y-2 p-5">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : selectedMembers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="mx-auto size-5 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">No roster entries</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add a provisioned member to this workspace.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/70">
                  {selectedMembers.map((member) => {
                    const user = usersById.get(member.userId);
                    const isConfirming = confirmMemberId === member.id;
                    return (
                      <div key={member.id} className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {user?.name ?? "Unknown member"}
                            </p>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {user?.email ?? member.userId}
                            </p>
                          </div>
                          {isConfirming ? (
                            <span className="font-mono text-[10px] text-destructive uppercase">
                              Confirm remove
                            </span>
                          ) : (
                            <select
                              value={member.role}
                              onChange={(event) =>
                                void handleMemberRoleChange(
                                  member,
                                  event.target.value as OrganizationRole,
                                )
                              }
                              disabled={pendingAction === member.id}
                              className="h-7 border border-input bg-transparent px-2 text-[10px] tracking-[0.08em] text-muted-foreground uppercase outline-none focus-visible:border-ring"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                              <option value="owner">Owner</option>
                            </select>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            Joined {formatDate(member.createdAt)}
                          </span>
                          {isConfirming ? (
                            <span className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmMemberId(null)}
                                disabled={pendingAction === member.id}
                              >
                                Keep
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => void handleDeleteMember(member)}
                                disabled={pendingAction === member.id}
                              >
                                {pendingAction === member.id ? "Removing..." : "Remove"}
                              </Button>
                            </span>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmMemberId(member.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
