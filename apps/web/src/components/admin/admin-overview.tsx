"use client";

import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Activity, ArrowUpRight, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";

type ListUsersResponse = Awaited<ReturnType<typeof authClient.admin.listUsers>>;
type AdminUser = NonNullable<ListUsersResponse["data"]>["users"][number];

export function AdminOverview() {
  const organizations = useQuery(api.admin.listOrganizations, { limit: 100 });
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void authClient.admin
      .listUsers({ query: { limit: 100 } })
      .then((result) => {
        if (!active) return;
        if (result.error) {
          setUsersError(result.error.message || "Member data unavailable");
          return;
        }
        setUsers(result.data?.users ?? []);
      })
      .catch(() => {
        if (active) setUsersError("Member data unavailable");
      });
    return () => {
      active = false;
    };
  }, []);

  const isLoading = users === null || organizations === undefined;
  const activeMembers = users?.filter((user) => !user.banned).length;

  return (
    <div className="space-y-10">
      <section className="flex flex-col justify-between gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Administration / overview
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em]">Admin console</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage access, organizations, and the health of the workspace.
          </p>
        </div>
        <Link
          href="/home"
          className="inline-flex h-9 items-center gap-2 border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
        >
          Back to workspace <ArrowUpRight className="size-3.5" />
        </Link>
      </section>
      <div className="border border-emerald-500/25 bg-emerald-500/5 p-5 text-sm">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="size-4 text-emerald-500" /> Admin access confirmed
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Live directory and organization data are protected by the Better Auth admin plugin.
        </p>
      </div>
      {usersError ? <p className="text-xs text-destructive">{usersError}</p> : null}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Active members",
            value: isLoading ? "--" : String(activeMembers ?? 0),
            icon: Users,
          },
          {
            label: "Organizations",
            value: isLoading ? "--" : String(organizations?.length ?? 0).padStart(2, "0"),
            icon: ShieldCheck,
          },
          { label: "System health", value: isLoading ? "Checking" : "Operational", icon: Activity },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-border/70 bg-background p-5">
            <Icon className="size-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-8 text-4xl font-medium tracking-[-0.07em]">{value}</p>
            <p className="mt-2 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
              {label}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
