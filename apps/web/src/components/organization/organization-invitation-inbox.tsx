"use client";

import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { Button } from "@better-convex-stack/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@better-convex-stack/ui/components/empty";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { ArrowRight, Building2, Clock3, MailCheck, TimerOff } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "convex/react";

import { formatOrganizationRole } from "@/components/organization/organization-member-types";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function OrganizationInvitationInbox() {
  const invitations = useQuery(api.organizations.listMyInvitations);

  if (invitations === undefined) {
    return <InvitationInboxLoading />;
  }

  const activeInvitations = invitations.filter(
    (invitation) => invitation.status === "pending" && invitation.expiresAt > Date.now(),
  );
  const expiredInvitations = invitations.filter(
    (invitation) => invitation.status === "pending" && invitation.expiresAt <= Date.now(),
  );

  return (
    <div className="space-y-8">
      <section className="border-b border-border/70 pb-8">
        <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
          Personal workspace
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em]">Invitations</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Review invitations sent to {invitations[0]?.email ?? "your account"} and choose which
          workspaces to join.
        </p>
      </section>

      {activeInvitations.length ? (
        <section className="space-y-3" aria-labelledby="active-invitations-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                Waiting for you
              </p>
              <h2 id="active-invitations-title" className="mt-1 text-sm font-medium">
                Active invitations
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">{activeInvitations.length} open</span>
          </div>

          <div className="space-y-3">
            {activeInvitations.map((invitation) => (
              <InvitationCard key={invitation.id} invitation={invitation} />
            ))}
          </div>
        </section>
      ) : (
        <Empty className="min-h-72 border border-border/70 bg-background">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MailCheck />
            </EmptyMedia>
            <EmptyTitle>No invitations waiting</EmptyTitle>
            <EmptyDescription>
              Invitations sent to this account will appear here until they are accepted or expire.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link href="/home" />} nativeButton={false} variant="outline" size="sm">
              Back to overview
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {expiredInvitations.length ? (
        <section
          className="border border-border/70 bg-background"
          aria-labelledby="expired-invitations-title"
        >
          <div className="flex items-start gap-3 border-b border-border/70 px-5 py-4">
            <TimerOff className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <h2 id="expired-invitations-title" className="text-sm font-medium">
                Expired invitations
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Ask the workspace owner to send a new invitation.
              </p>
            </div>
          </div>
          <div className="divide-y divide-border/70">
            {expiredInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center gap-3 px-5 py-4 text-sm">
                <Building2 className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{invitation.organizationName}</span>
                <span className="text-xs text-muted-foreground">
                  Expired {dateFormatter.format(invitation.expiresAt)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function InvitationCard({
  invitation,
}: {
  invitation: NonNullable<
    ReturnType<typeof useQuery<typeof api.organizations.listMyInvitations>>
  >[number];
}) {
  const invitationHref = `/accept-invitation?id=${encodeURIComponent(invitation.id)}` as Route;

  return (
    <article className="border border-border/70 bg-background">
      <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center bg-foreground text-background">
            <Building2 className="size-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium">{invitation.organizationName}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Workspace invitation</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground">
          <Clock3 className="size-3" />
          Expires {dateFormatter.format(invitation.expiresAt)}
        </span>
      </div>

      <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid grid-cols-2 gap-x-10 gap-y-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              Role
            </p>
            <p className="mt-1 text-sm font-medium">{formatOrganizationRole(invitation.role)}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              Invited
            </p>
            <p className="mt-1 text-sm font-medium">{dateFormatter.format(invitation.createdAt)}</p>
          </div>
        </div>
        <Button render={<Link href={invitationHref} />} nativeButton={false} className="gap-2">
          Review invitation
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </article>
  );
}

function InvitationInboxLoading() {
  return (
    <div className="space-y-8" aria-label="Loading invitations">
      <section className="space-y-3 border-b border-border/70 pb-8">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </section>
      <section className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </section>
    </div>
  );
}
