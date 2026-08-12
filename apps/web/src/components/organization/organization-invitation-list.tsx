"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { Clock3, Mail, UserRoundPlus, X } from "lucide-react";

import {
  type OrganizationInvitation,
  formatOrganizationRole,
} from "@/components/organization/organization-member-types";

export function OrganizationInvitationList({
  invitations,
  isLoading,
  canCancel,
  pendingInvitationId,
  onCancel,
}: {
  invitations: OrganizationInvitation[];
  isLoading: boolean;
  canCancel: boolean;
  pendingInvitationId: string | null;
  onCancel: (invitationId: string) => void;
}) {
  const pendingInvitations = invitations.filter(
    (invitation) =>
      invitation.status === "pending" && new Date(invitation.expiresAt).getTime() > Date.now(),
  );

  return (
    <section
      className="border border-border/70 bg-background"
      aria-labelledby="pending-invitations-title"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            In progress
          </p>
          <h2 id="pending-invitations-title" className="mt-1 text-sm font-medium">
            Active invitations
          </h2>
        </div>
        <UserRoundPlus className="mt-0.5 size-4 text-muted-foreground" />
      </div>

      {isLoading ? (
        <div className="space-y-4 p-5" aria-label="Loading invitations">
          {["one", "two"].map((item) => (
            <div key={item} className="space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      ) : pendingInvitations.length ? (
        <div>
          {pendingInvitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                  <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{invitation.email}</span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock3 className="size-3 shrink-0" />
                  {formatOrganizationRole(invitation.role)} - expires{" "}
                  {new Date(invitation.expiresAt).toLocaleDateString()}
                </p>
              </div>
              {canCancel ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Cancel invitation for ${invitation.email}`}
                  disabled={pendingInvitationId === invitation.id}
                  onClick={() => onCancel(invitation.id)}
                >
                  <X className="size-3.5" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <UserRoundPlus className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No active invitations</p>
          <p className="mt-1 text-xs text-muted-foreground">
            New invitations will appear here until they are accepted or expire.
          </p>
        </div>
      )}
    </section>
  );
}
