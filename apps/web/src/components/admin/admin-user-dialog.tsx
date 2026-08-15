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
  type AdminUser,
  type UserDialogState,
  type UserFormValues,
  type UserRole,
  type SubscriptionTier,
} from "./admin-management-utils";

type AdminUserDialogProps = {
  state: UserDialogState | null;
  user: AdminUser | undefined;
  pendingUserId: string | null;
  onClose: () => void;
  onSave: (values: UserFormValues) => Promise<void>;
  onRemove: () => Promise<void>;
};

export function AdminUserDialog({
  state,
  user,
  pendingUserId,
  onClose,
  onSave,
  onRemove,
}: AdminUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.mode === "edit" && user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role === "admin" ? "admin" : "user");
      setTier(user.tier ?? "free");
    } else {
      setName("");
      setEmail("");
      setRole("user");
      setTier("free");
    }
    setPassword("");
    setFormError(null);
  }, [state?.mode, user]);

  if (!state) return null;

  const isDelete = state.mode === "delete";
  const isEditing = state.mode === "edit";
  const isPending = pendingUserId !== null;

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const nextName = String(formData.get("name") ?? "").trim();
    const nextEmail = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const nextPassword = String(formData.get("password") ?? "");

    if (!nextName) {
      setFormError("Enter the member's name.");
      return;
    }
    if (!nextEmail || !nextEmail.includes("@")) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (!isEditing && nextPassword.length < 8) {
      setFormError("Set a temporary password with at least 8 characters.");
      return;
    }

    setFormError(null);
    try {
      await onSave({ name: nextName, email: nextEmail, password: nextPassword, role, tier });
    } catch (error) {
      setFormError(getErrorMessage(error, "The member could not be saved."));
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent>
        {isDelete ? (
          <>
            <DialogHeader>
              <DialogTitle>Remove member?</DialogTitle>
              <DialogDescription>
                {user?.name ?? "This member"} will be removed after organization memberships are
                checked.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose
                render={
                  <Button type="button" variant="ghost" disabled={isPending}>
                    Keep member
                  </Button>
                }
              />
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() => void onRemove()}
              >
                {isPending ? "Removing…" : "Remove member"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit member" : "Add member"}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update this member's account or administrator role."
                  : "Create a member account that can be added to an organization."}
              </DialogDescription>
            </DialogHeader>
            <form
              id="admin-member-form"
              className="grid gap-4 px-5 pt-5 sm:grid-cols-2 sm:px-6 sm:pt-6"
              onSubmit={handleSubmit}
            >
              <div className="space-y-2">
                <Label htmlFor="admin-member-name">Name</Label>
                <Input
                  id="admin-member-name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-member-email">Email</Label>
                <Input
                  id="admin-member-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  disabled={isPending}
                />
              </div>
              {!isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="admin-member-password">Temporary password</Label>
                  <Input
                    id="admin-member-password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    disabled={isPending}
                  />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="admin-member-role">Role</Label>
                <select
                  id="admin-member-role"
                  name="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  disabled={isPending}
                  className="h-9 w-full border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-member-tier">Tier</Label>
                <select
                  id="admin-member-tier"
                  name="tier"
                  value={tier}
                  onChange={(event) => setTier(event.target.value as SubscriptionTier)}
                  disabled={isPending}
                  className="h-9 w-full border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
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
              <Button type="submit" form="admin-member-form" disabled={isPending}>
                {isEditing ? <Check /> : <Plus />}
                {isPending ? "Saving…" : isEditing ? "Save changes" : "Add member"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
