"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@better-convex-stack/ui/components/avatar";
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
import { ArrowUpRight, Building2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@better-convex-stack/backend/convex/_generated/api";

import { authClient } from "@/lib/auth-client";

export function OrganizationOverview({ orgSlug }: { orgSlug: string }) {
  const organizationsQuery = authClient.useListOrganizations();
  const activeOrganizationQuery = authClient.useActiveOrganization();
  const requestedOrganizationId = useRef<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const organization = organizationsQuery.data?.find((item) => item.slug === orgSlug);
  const activeOrganization =
    activeOrganizationQuery.data?.id === organization?.id ? activeOrganizationQuery.data : null;

  const convexMembersSummary = useQuery(
    api.organizations.getMyOrganizationsMembers,
    organization?.id ? { organizationIds: [organization.id] } : "skip"
  );

  const convexOrgData = convexMembersSummary?.[0];

  useEffect(() => {
    if (
      !organization ||
      activeOrganizationQuery.isPending ||
      activeOrganizationQuery.data?.id === organization.id ||
      requestedOrganizationId.current === organization.id
    ) {
      return;
    }

    requestedOrganizationId.current = organization.id;
    void authClient.organization
      .setActive({ organizationId: organization.id })
      .then(({ error }) => {
        if (error) setSyncError(error.message || "This workspace could not be selected.");
      });
  }, [activeOrganizationQuery.data?.id, activeOrganizationQuery.isPending, organization]);

  if (organizationsQuery.isPending || (organization && activeOrganizationQuery.isPending && !convexOrgData)) {
    return (
      <div className="space-y-8" aria-label="Loading organization workspace">
        <section className="border-b border-border/70 pb-8">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-4 h-12 w-72" />
          <Skeleton className="mt-4 h-4 w-96 max-w-full" />
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </section>
      </div>
    );
  }

  if (organizationsQuery.error) {
    return (
      <section className="border border-destructive/30 bg-destructive/5 p-5" role="alert">
        <p className="text-sm font-medium">This workspace could not be loaded.</p>
        <p className="mt-1 text-xs text-muted-foreground">{organizationsQuery.error.message}</p>
      </section>
    );
  }

  if (!organization) {
    return (
      <Empty className="min-h-96 border border-border/70 bg-background">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2 />
          </EmptyMedia>
          <EmptyTitle>Workspace not found</EmptyTitle>
          <EmptyDescription>
            This workspace is not connected to your account, or its URL has changed.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href="/home/organizations" />} size="sm">
            Manage organizations
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const betterAuthMembers = activeOrganization?.members ?? [];
  const memberCount =
    betterAuthMembers.length > 0
      ? betterAuthMembers.length
      : convexOrgData?.memberCount ?? 1;

  const ownerCount =
    betterAuthMembers.length > 0
      ? betterAuthMembers.filter((m) => m.role === "owner").length
      : convexOrgData?.members.filter((m) => m.role === "owner").length ?? 1;

  const createdDate = new Date(organization.createdAt).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });

  return (
    <div className="space-y-10">
      <section className="flex flex-col justify-between gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            <Building2 className="size-3.5" /> Organization workspace
          </div>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em] sm:text-5xl">
            {organization.name}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            A live workspace connected to your Better Auth organization membership.
          </p>
          {syncError ? (
            <p className="mt-3 text-xs text-destructive" role="alert">
              {syncError}
            </p>
          ) : null}
        </div>
        <Link
          href="/home"
          className="inline-flex h-9 items-center gap-2 border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
        >
          Personal view <ArrowUpRight className="size-3.5" />
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Members",
            value: String(memberCount),
            note: "Team members with access",
          },
          {
            label: "Owners",
            value: String(ownerCount),
            note: "Accountable for this workspace",
          },
          { label: "Created", value: createdDate, note: `/${organization.slug}` },
        ].map((stat) => (
          <div key={stat.label} className="border border-border/70 bg-background p-5">
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              {stat.label}
            </p>
            <p className="mt-8 truncate text-3xl font-medium tracking-[-0.07em]">{stat.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{stat.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-border/70 bg-background">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                Members
              </p>
              <h2 className="mt-1 text-sm font-medium">Team members in this workspace</h2>
            </div>
            <Link
              href={`/home/${organization.slug}/members`}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>View all</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          {betterAuthMembers.length > 0 ? (
            <div>
              {betterAuthMembers.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar size="sm">
                      {member.user.image ? (
                        <AvatarImage src={member.user.image} alt={member.user.name} />
                      ) : null}
                      <AvatarFallback className="text-[10px]">
                        {member.user.name
                          .split(" ")
                          .map((p) => p[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")
                          .toUpperCase() || member.user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{member.user.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    {member.role === "owner" ? (
                      <ShieldCheck className="size-3.5 text-emerald-500" />
                    ) : null}
                    <span className="capitalize">{member.role}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : convexOrgData?.members && convexOrgData.members.length > 0 ? (
            <div>
              {convexOrgData.members.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar size="sm">
                      {member.image ? (
                        <AvatarImage src={member.image} alt={member.name} />
                      ) : null}
                      <AvatarFallback className="text-[10px]">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{member.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    {member.role === "owner" ? (
                      <ShieldCheck className="size-3.5 text-emerald-500" />
                    ) : null}
                    <span className="capitalize">{member.role}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 text-sm text-muted-foreground">
              Member details will appear here once the workspace finishes syncing.
            </div>
          )}
        </div>

        <div className="border border-border/70 bg-foreground p-5 text-background">
          <p className="font-mono text-[10px] tracking-[0.16em] text-background/55 uppercase">
            Workspace identity
          </p>
          <p className="mt-8 text-3xl font-medium tracking-[-0.07em]">/{organization.slug}</p>
          <p className="mt-3 max-w-xs text-xs leading-6 text-background/60">
            This slug is the stable address your team uses to return to the workspace.
          </p>
          <Link
            href="/home/organizations"
            className="mt-10 inline-flex items-center gap-2 border border-background/25 px-3 py-2 text-xs font-medium transition-colors hover:bg-background/10"
          >
            Edit organization <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
