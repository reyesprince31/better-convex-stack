"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import { AdminUserDialog } from "./admin-user-dialog";
import { AdminUsersDirectory } from "./admin-users-directory";
import {
  getErrorMessage,
  type AdminUser,
  type UserDialogState,
  type UserFormValues,
} from "./admin-management-utils";
import { authClient } from "@/lib/auth-client";

export function AdminUsersManagement() {
  const removeUser = useMutation(api.admin.removeUser);
  const setUserTier = useMutation(api.entitlements.setTier);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const entitlements = useQuery(api.entitlements.listForUsers, {
    userIds: users.map((user) => user.id),
  }) as { userId: string; tier: "enterprise" | "free" | "pro" }[] | undefined;
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<UserDialogState | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const tierByUserId = new Map(entitlements?.map((item) => [item.userId, item.tier]));
  const usersWithTiers = users.map((user) => ({
    ...user,
    tier: tierByUserId.get(user.id) ?? "free",
  }));

  const loadUsers = useCallback(async () => {
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
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadUsers(), 180);
    return () => window.clearTimeout(timeout);
  }, [loadUsers]);

  async function handleSave(values: UserFormValues) {
    if (!dialog || (dialog.mode !== "create" && dialog.mode !== "edit")) return;

    const editingUserId = dialog.mode === "edit" ? dialog.userId : null;
    setPendingUserId(editingUserId ?? "new");
    try {
      if (editingUserId) {
        const updateResult = await authClient.admin.updateUser({
          userId: editingUserId,
          data: { email: values.email, name: values.name },
        });
        if (updateResult.error) {
          throw new Error(getErrorMessage(updateResult.error, "The member could not be updated."));
        }

        const currentUser = usersWithTiers.find((user) => user.id === editingUserId);
        if (currentUser?.role !== values.role) {
          const roleResult = await authClient.admin.setRole({
            userId: editingUserId,
            role: values.role,
          });
          if (roleResult.error) {
            throw new Error(
              getErrorMessage(roleResult.error, "The member role could not be updated."),
            );
          }
        }
        if (currentUser?.tier !== values.tier) {
          await setUserTier({ userId: editingUserId, tier: values.tier });
        }
        toast.success("Member updated");
      } else {
        const createResult = await authClient.admin.createUser({
          email: values.email,
          name: values.name,
          password: values.password,
          role: values.role,
        });
        if (createResult.error) {
          throw new Error(getErrorMessage(createResult.error, "The member could not be created."));
        }
        const newUserId = createResult.data?.user.id;
        if (newUserId && values.tier !== "free") {
          await setUserTier({ userId: newUserId, tier: values.tier });
        }
        toast.success("Member created");
      }
      setDialog(null);
      await loadUsers();
    } catch (error) {
      throw new Error(getErrorMessage(error, "The member could not be saved."));
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleRemove() {
    if (!dialog || dialog.mode !== "delete") return;

    setPendingUserId(dialog.userId);
    try {
      await removeUser({ userId: dialog.userId });
      toast.success("Member removed");
      setDialog(null);
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The member could not be removed.");
    } finally {
      setPendingUserId(null);
    }
  }

  const activeUser =
    dialog && "userId" in dialog
      ? usersWithTiers.find((user) => user.id === dialog.userId)
      : undefined;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Administration / members
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em]">Members</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Create members here before adding them to an organization.
          </p>
        </div>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => setDialog({ mode: "create" })}
        >
          <UserPlus />
          Add member
        </Button>
      </section>

      <AdminUsersDirectory
        users={usersWithTiers}
        total={total}
        search={search}
        isLoading={isLoading || entitlements === undefined}
        loadError={loadError}
        pendingUserId={pendingUserId}
        onSearchChange={setSearch}
        onRetry={() => void loadUsers()}
        onEdit={(user) => setDialog({ mode: "edit", userId: user.id })}
        onRemove={(user) => setDialog({ mode: "delete", userId: user.id })}
      />

      <AdminUserDialog
        state={dialog}
        user={activeUser}
        pendingUserId={pendingUserId}
        onClose={() => setDialog(null)}
        onSave={handleSave}
        onRemove={handleRemove}
      />
    </div>
  );
}
