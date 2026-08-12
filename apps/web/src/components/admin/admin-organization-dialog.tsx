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
import { Check, Plus } from "lucide-react";
import type * as React from "react";
import { useEffect, useState } from "react";

import {
  getErrorMessage,
  slugify,
  userLabel,
  type AddMemberFormValues,
  type AdminUser,
  type OrganizationDialogState,
  type OrganizationFormValues,
  type OrganizationMember,
  type OrganizationRole,
  type OrganizationSummary,
} from "./admin-management-utils";

type AdminOrganizationDialogProps = {
  state: OrganizationDialogState | null;
  organization: OrganizationSummary | undefined;
  member: OrganizationMember | undefined;
  selectedOrganizationName: string;
  users: AdminUser[];
  memberUsersById: Map<string, AdminUser>;
  pendingAction: string | null;
  onClose: () => void;
  onSaveOrganization: (values: OrganizationFormValues) => Promise<void>;
  onAddMember: (values: AddMemberFormValues) => Promise<void>;
  onDeleteOrganization: () => Promise<void>;
  onDeleteMember: () => Promise<void>;
};

function OrganizationForm({
  mode,
  organization,
  users,
  pendingAction,
  onSubmit,
}: {
  mode: "create" | "edit";
  organization: OrganizationSummary | undefined;
  users: AdminUser[];
  pendingAction: string | null;
  onSubmit: (values: OrganizationFormValues) => Promise<void>;
}) {
  const isEditing = mode === "edit";
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [ownerUserId, setOwnerUserId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setName(organization?.name ?? "");
    setSlug(organization?.slug ?? "");
    setSlugTouched(Boolean(organization));
    setOwnerUserId(organization?.ownerUserId ?? users[0]?.id ?? "");
    setFormError(null);
  }, [organization, users]);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
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
    if (!isEditing && !nextOwnerUserId) {
      setFormError("Select the first owner before creating the organization.");
      return;
    }

    setFormError(null);
    try {
      await onSubmit({ name: nextName, slug: nextSlug, ownerUserId: nextOwnerUserId });
    } catch (error) {
      setFormError(getErrorMessage(error, "The organization could not be saved."));
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit organization" : "Create organization"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the name or URL for this organization."
            : "Create a workspace and assign its first owner."}
        </DialogDescription>
      </DialogHeader>
      <form
        id="admin-organization-form"
        className="grid gap-4 px-5 pt-5 sm:grid-cols-2 sm:px-6 sm:pt-6"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-2">
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
            autoFocus
            disabled={pendingAction !== null}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="admin-organization-slug">URL slug</Label>
          <Input
            id="admin-organization-slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugTouched(true);
            }}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            disabled={pendingAction !== null}
          />
        </div>
        {!isEditing ? (
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="admin-organization-owner">First owner</Label>
            <select
              id="admin-organization-owner"
              name="ownerUserId"
              value={ownerUserId}
              onChange={(event) => setOwnerUserId(event.target.value)}
              disabled={pendingAction !== null}
              className="h-9 w-full border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
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
          <p className="text-xs text-destructive sm:col-span-2" role="alert">
            {formError}
          </p>
        ) : null}
      </form>
      <DialogFooter>
        <DialogClose
          render={
            <Button type="button" variant="ghost" disabled={pendingAction !== null}>
              Cancel
            </Button>
          }
        />
        <Button type="submit" form="admin-organization-form" disabled={pendingAction !== null}>
          <Check />
          {pendingAction === "organization-form"
            ? "Saving…"
            : isEditing
              ? "Save changes"
              : "Create organization"}
        </Button>
      </DialogFooter>
    </>
  );
}

function AddMemberForm({
  users,
  selectedOrganizationName,
  pendingAction,
  onSubmit,
}: {
  users: AdminUser[];
  selectedOrganizationName: string;
  pendingAction: string | null;
  onSubmit: (values: AddMemberFormValues) => Promise<void>;
}) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<OrganizationRole>("member");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      setFormError("Select a member before continuing.");
      return;
    }

    setFormError(null);
    try {
      await onSubmit({ userId, role });
    } catch (error) {
      setFormError(getErrorMessage(error, "The member could not be added."));
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add member</DialogTitle>
        <DialogDescription>
          Add a member to {selectedOrganizationName} and choose a role.
        </DialogDescription>
      </DialogHeader>
      <form
        id="organization-member-form"
        className="grid gap-4 px-5 pt-5 sm:px-6 sm:pt-6"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-2">
          <Label htmlFor="organization-member-user">Member</Label>
          <select
            id="organization-member-user"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            disabled={pendingAction !== null}
            className="h-9 w-full border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          >
            <option value="">Select a member</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {userLabel(user)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="organization-member-role">Role</Label>
          <select
            id="organization-member-role"
            value={role}
            onChange={(event) => setRole(event.target.value as OrganizationRole)}
            disabled={pendingAction !== null}
            className="h-9 w-full border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
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
            <Button type="button" variant="ghost" disabled={pendingAction !== null}>
              Cancel
            </Button>
          }
        />
        <Button
          type="submit"
          form="organization-member-form"
          disabled={!userId || pendingAction !== null}
        >
          <Plus />
          {pendingAction === "member-add" ? "Adding…" : "Add member"}
        </Button>
      </DialogFooter>
    </>
  );
}

function DeleteOrganizationConfirmation({
  organization,
  pendingAction,
  onDelete,
}: {
  organization: OrganizationSummary | undefined;
  pendingAction: string | null;
  onDelete: () => Promise<void>;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete organization?</DialogTitle>
        <DialogDescription>
          {organization?.name ?? "This organization"} will be removed with its members and
          invitations.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose
          render={
            <Button type="button" variant="ghost" disabled={pendingAction !== null}>
              Keep organization
            </Button>
          }
        />
        <Button
          type="button"
          variant="destructive"
          disabled={pendingAction !== null}
          onClick={() => void onDelete()}
        >
          {pendingAction ? "Deleting…" : "Delete organization"}
        </Button>
      </DialogFooter>
    </>
  );
}

function DeleteMemberConfirmation({
  organizationName,
  member,
  memberUsersById,
  pendingAction,
  onDelete,
}: {
  organizationName: string;
  member: OrganizationMember | undefined;
  memberUsersById: Map<string, AdminUser>;
  pendingAction: string | null;
  onDelete: () => Promise<void>;
}) {
  const memberName = member ? memberUsersById.get(member.userId)?.name : undefined;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Remove member?</DialogTitle>
        <DialogDescription>
          {memberName ?? "This member"} will be removed from {organizationName}.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose
          render={
            <Button type="button" variant="ghost" disabled={pendingAction !== null}>
              Keep member
            </Button>
          }
        />
        <Button
          type="button"
          variant="destructive"
          disabled={pendingAction !== null}
          onClick={() => void onDelete()}
        >
          {pendingAction ? "Removing…" : "Remove member"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function AdminOrganizationDialog({
  state,
  organization,
  member,
  selectedOrganizationName,
  users,
  memberUsersById,
  pendingAction,
  onClose,
  onSaveOrganization,
  onAddMember,
  onDeleteOrganization,
  onDeleteMember,
}: AdminOrganizationDialogProps) {
  if (!state) return null;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && pendingAction === null) onClose();
      }}
    >
      <DialogContent>
        {state.mode === "delete-organization" ? (
          <DeleteOrganizationConfirmation
            organization={organization}
            pendingAction={pendingAction}
            onDelete={onDeleteOrganization}
          />
        ) : state.mode === "delete-member" ? (
          <DeleteMemberConfirmation
            organizationName={selectedOrganizationName}
            member={member}
            memberUsersById={memberUsersById}
            pendingAction={pendingAction}
            onDelete={onDeleteMember}
          />
        ) : state.mode === "add-member" ? (
          <AddMemberForm
            users={users}
            selectedOrganizationName={selectedOrganizationName}
            pendingAction={pendingAction}
            onSubmit={onAddMember}
          />
        ) : (
          <OrganizationForm
            mode={state.mode}
            organization={organization}
            users={users}
            pendingAction={pendingAction}
            onSubmit={onSaveOrganization}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
