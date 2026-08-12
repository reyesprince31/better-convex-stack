"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { Plus, Users } from "lucide-react";

import {
  formatDate,
  type AdminUser,
  type OrganizationMember,
  type OrganizationRole,
  type OrganizationSummary,
} from "./admin-management-utils";

type AdminOrganizationRosterProps = {
  organization: OrganizationSummary | undefined;
  members: OrganizationMember[] | undefined;
  usersById: Map<string, AdminUser>;
  pendingAction: string | null;
  onAddMember: () => void;
  onRoleChange: (member: OrganizationMember, role: OrganizationRole) => void;
  onRemoveMember: (member: OrganizationMember) => void;
};

export function AdminOrganizationRoster({
  organization,
  members,
  usersById,
  pendingAction,
  onAddMember,
  onRoleChange,
  onRemoveMember,
}: AdminOrganizationRosterProps) {
  return (
    <section className="border border-border/70 bg-background" aria-labelledby="roster-title">
      <div className="border-b border-border/70 p-5 sm:p-6">
        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          Organization roster
        </p>
        <h2 id="roster-title" className="mt-2 text-lg font-medium">
          {organization?.name ?? "Select an organization"}
        </h2>
        {organization ? (
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">/{organization.slug}</p>
        ) : null}
      </div>
      {!organization ? (
        <div className="p-8 text-center text-xs text-muted-foreground">
          Select a workspace to manage its members.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 border-b border-border/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Members</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add members and update their roles.
                </p>
              </div>
            </div>
            <Button type="button" size="sm" className="w-full gap-2 sm:w-auto" onClick={onAddMember}>
              <Plus />
              Add member
            </Button>
          </div>
          {members === undefined ? (
            <div className="space-y-2 p-5">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No roster entries</p>
              <p className="mt-1 text-xs text-muted-foreground">Add a member to this workspace.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {members.map((member) => {
                const user = usersById.get(member.userId);
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
                      <select
                        aria-label={`Change role for ${user?.name ?? "member"}`}
                        value={member.role}
                        onChange={(event) =>
                          onRoleChange(member, event.target.value as OrganizationRole)
                        }
                        disabled={pendingAction === member.id}
                        className="h-8 max-w-28 border border-input bg-background px-2 text-xs text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                      </select>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        Joined {formatDate(member.createdAt)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMember(member)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
