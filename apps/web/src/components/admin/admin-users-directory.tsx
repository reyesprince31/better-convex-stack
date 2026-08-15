"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import { Input } from "@better-convex-stack/ui/components/input";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { KeyRound, Search, Shield } from "lucide-react";

import { formatDate, type AdminUser } from "./admin-management-utils";

type AdminUsersDirectoryProps = {
  users: AdminUser[];
  total: number;
  search: string;
  isLoading: boolean;
  loadError: string | null;
  pendingUserId: string | null;
  onSearchChange: (value: string) => void;
  onRetry: () => void;
  onEdit: (user: AdminUser) => void;
  onRemove: (user: AdminUser) => void;
};

function UserMark({ name }: { name: string }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center bg-foreground text-background">
      <span className="font-mono text-[11px] font-semibold tracking-[-0.12em]">
        {name.slice(0, 2).toLowerCase()}
      </span>
    </span>
  );
}

export function AdminUsersDirectory({
  users,
  total,
  search,
  isLoading,
  loadError,
  pendingUserId,
  onSearchChange,
  onRetry,
  onEdit,
  onRemove,
}: AdminUsersDirectoryProps) {
  return (
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
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name…"
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
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : users.length === 0 ? (
        <div className="p-10 text-center">
          <KeyRound className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No members match this search</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add the first member to unlock organization ownership.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/70">
          {users.map((user) => {
            const isPending = pendingUserId === user.id;
            return (
              <div
                key={user.id}
                className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <UserMark name={user.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                    <Shield className="size-3" /> {user.role ?? "user"}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                    {user.tier ?? "free"}
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
                  <Button type="button" variant="outline" size="sm" onClick={() => onEdit(user)}>
                    Edit
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(user)}>
                    Remove
                  </Button>
                  {isPending ? <span className="sr-only">Updating member</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
