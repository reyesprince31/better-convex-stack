"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@better-convex-stack/ui/components/avatar";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { ShieldCheck, UserCheck, Users } from "lucide-react";

import {
  type OrganizationMember,
  formatOrganizationRole,
  getInitials,
  hasOrganizationRole,
} from "@/components/organization/organization-member-types";

export function OrganizationMemberList({
  members,
  isLoading,
  canManageMembers,
  canSetOwner,
  pendingMemberId,
  onRoleChange,
}: {
  members: OrganizationMember[];
  isLoading: boolean;
  canManageMembers: boolean;
  canSetOwner: boolean;
  pendingMemberId: string | null;
  onRoleChange: (memberId: string, role: string) => void;
}) {
  return (
    <section className="border border-border/70 bg-background" aria-labelledby="member-list-title">
      <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            Team directory
          </p>
          <h2 id="member-list-title" className="mt-1 text-sm font-medium">
            {members.length === 1 ? "1 member" : `${members.length} members`}
          </h2>
        </div>
        <Users className="mt-0.5 size-4 text-muted-foreground" />
      </div>

      {isLoading ? (
        <div className="space-y-4 p-5" aria-label="Loading members">
          {["one", "two", "three"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-48 max-w-full" />
              </div>
              <Skeleton className="h-7 w-24" />
            </div>
          ))}
        </div>
      ) : members.length ? (
        <div>
          {members.map((member) => {
            const memberIsOwner = hasOrganizationRole(member.role, "owner");
            const canEditMember = canManageMembers && (!memberIsOwner || canSetOwner);
            const roleValue = member.role.split(",")[0]?.trim() || "member";

            return (
              <div
                key={member.id}
                className="flex flex-col gap-4 border-b border-border/70 px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar size="default">
                    {member.user.image ? <AvatarImage src={member.user.image} alt={member.user.name} /> : null}
                    <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{member.user.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:shrink-0">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                    {memberIsOwner ? <ShieldCheck className="size-3 text-emerald-600" /> : <UserCheck className="size-3" />}
                    {formatOrganizationRole(member.role)}
                  </span>
                  <select
                    aria-label={`Change role for ${member.user.name}`}
                    value={roleValue}
                    onChange={(event) => onRoleChange(member.id, event.target.value)}
                    className="h-7 border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!canEditMember || pendingMemberId === member.id}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    {canSetOwner || memberIsOwner ? <option value="owner">Owner</option> : null}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center">
          <Users className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No members found</p>
          <p className="mt-1 text-xs text-muted-foreground">Invite the first teammate to start sharing this workspace.</p>
        </div>
      )}
    </section>
  );
}
