"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import { Input } from "@better-convex-stack/ui/components/input";
import { Label } from "@better-convex-stack/ui/components/label";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { Check, KeyRound, Plus, Search, Shield, Trash2, UserPlus, X } from "lucide-react";
import type * as React from "react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

type ListUsersResponse = Awaited<ReturnType<typeof authClient.admin.listUsers>>;
type AdminUser = NonNullable<ListUsersResponse["data"]>["users"][number];
type UserRole = "admin" | "user";

function getErrorMessage(error: { message?: string } | null | undefined, fallback: string) {
  return error?.message || fallback;
}

function formatDate(value: Date | number | string) {
  return new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function UserMark({ name }: { name: string }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center bg-foreground text-background">
      <span className="font-mono text-[11px] font-semibold tracking-[-0.12em]">
        {name.slice(0, 2).toLowerCase()}
      </span>
    </span>
  );
}

export function AdminUsersManagement() {
  const removeUser = useMutation(api.admin.removeUser);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [formError, setFormError] = useState<string | null>(null);

  async function loadUsers() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await authClient.admin.listUsers({
        query: {
          limit: 100,
          searchField: "name",
          searchOperator: "contains",
          searchValue: search.trim() || undefined,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      });
      if (result.error) {
        throw new Error(getErrorMessage(result.error, "The member directory could not be loaded."));
      }
      setUsers(result.data?.users ?? []);
      setTotal(result.data?.total ?? 0);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "The member directory could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadUsers(), 180);
    return () => window.clearTimeout(timeout);
  }, [search]);

  function openCreateForm() {
    setEditingUserId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(user: AdminUser) {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role === "admin" ? "admin" : "user");
    setFormError(null);
    setIsFormOpen(true);
    setConfirmDeleteId(null);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingUserId(null);
    setFormError(null);
  }

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
    if (!editingUserId && nextPassword.length < 8) {
      setFormError("Set a temporary password with at least 8 characters.");
      return;
    }

    setPendingUserId(editingUserId ?? "new");
    setFormError(null);
    try {
      if (editingUserId) {
        const updateResult = await authClient.admin.updateUser({
          userId: editingUserId,
          data: { email: nextEmail, name: nextName },
        });
        if (updateResult.error) {
          throw new Error(getErrorMessage(updateResult.error, "The member could not be updated."));
        }

        const currentUser = users.find((user) => user.id === editingUserId);
        if (currentUser?.role !== role) {
          const roleResult = await authClient.admin.setRole({ userId: editingUserId, role });
          if (roleResult.error) {
            throw new Error(
              getErrorMessage(roleResult.error, "The member role could not be updated."),
            );
          }
        }
        toast.success("Member updated");
      } else {
        const createResult = await authClient.admin.createUser({
          email: nextEmail,
          name: nextName,
          password: nextPassword,
          role,
        });
        if (createResult.error) {
          throw new Error(getErrorMessage(createResult.error, "The member could not be created."));
        }
        toast.success("Member provisioned");
      }
      closeForm();
      await loadUsers();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "The member could not be saved.");
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleRemove(user: AdminUser) {
    setPendingUserId(user.id);
    try {
      await removeUser({ userId: user.id });
      toast.success("Member removed");
      setConfirmDeleteId(null);
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The member could not be removed.");
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Administration / members
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em]">Members</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Provision a user before assigning them to an organization workspace.
          </p>
        </div>
        <Button type="button" onClick={openCreateForm}>
          <UserPlus />
          Provision member
        </Button>
      </section>

      {isFormOpen ? (
        <section
          className="border border-border/70 bg-background p-5 sm:p-6"
          aria-labelledby="member-form-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                {editingUserId ? "Update record" : "Create record"}
              </p>
              <h2 id="member-form-title" className="mt-2 text-lg font-medium">
                {editingUserId ? "Edit member" : "Provision a member"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                The temporary password is used for the member's first sign-in.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={closeForm}
              aria-label="Close member form"
            >
              <X />
            </Button>
          </div>
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="admin-member-name">Name</Label>
              <Input
                id="admin-member-name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
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
              />
            </div>
            {!editingUserId ? (
              <div className="space-y-2">
                <Label htmlFor="admin-member-password">Temporary password</Label>
                <Input
                  id="admin-member-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="admin-member-role">Role</Label>
              <select
                id="admin-member-role"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="h-8 w-full border border-input bg-transparent px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formError ? (
              <p className="text-xs text-destructive md:col-span-2">{formError}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 md:col-span-2">
              <Button type="submit" disabled={pendingUserId !== null}>
                {editingUserId ? <Check /> : <Plus />}
                {pendingUserId ? "Saving..." : editingUserId ? "Save member" : "Create member"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={closeForm}
                disabled={pendingUserId !== null}
              >
                Cancel
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <section
        className="border border-border/70 bg-background"
        aria-labelledby="member-directory-title"
      >
        <div className="flex flex-col gap-4 border-b border-border/70 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Directory
            </p>
            <h2 id="member-directory-title" className="mt-2 text-lg font-medium">
              {total ? `${total} member${total === 1 ? "" : "s"}` : "Member records"}
            </h2>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Search members by name</span>
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name"
              className="pl-8"
            />
          </label>
        </div>

        {isLoading ? (
          <div className="space-y-px p-5">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-16 w-full" />
            ))}
          </div>
        ) : loadError ? (
          <div className="p-6 text-sm">
            <p className="font-medium">Member records unavailable</p>
            <p className="mt-1 text-xs text-muted-foreground">{loadError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => void loadUsers()}
            >
              Try again
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center">
            <KeyRound className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No members match this search</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create the first member to unlock organization ownership.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/70">
            {users.map((user) => {
              const isDeleting = confirmDeleteId === user.id;
              const isPending = pendingUserId === user.id;
              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  {isDeleting ? (
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center bg-destructive/10 text-destructive">
                        <Trash2 className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Remove {user.name}?</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Organization memberships are checked before removal.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-w-0 items-center gap-3">
                      <UserMark name={user.name} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {isDeleting ? (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={isPending}
                        >
                          Keep member
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => void handleRemove(user)}
                          disabled={isPending}
                        >
                          {isPending ? "Removing..." : "Remove member"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                          <Shield className="size-3" /> {user.role ?? "user"}
                        </span>
                        {user.banned ? (
                          <span className="font-mono text-[10px] tracking-[0.12em] text-destructive uppercase">
                            Banned
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] tracking-[0.12em] text-emerald-600 uppercase dark:text-emerald-400">
                            Active
                          </span>
                        )}
                        <span className="hidden text-xs text-muted-foreground lg:inline">
                          Joined {formatDate(user.createdAt)}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(user.id)}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
