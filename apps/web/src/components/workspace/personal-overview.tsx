"use client";

import { ArrowUpRight, Check, CircleDot, Clock3, Plus } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { authClient } from "@/lib/auth-client";
import { mockPersonalWorkspace } from "@/lib/mock-workspace";

export function PersonalOverview() {
  const organizationsQuery = authClient.useListOrganizations();
  const organizations = organizationsQuery.data ?? [];
  const primaryOrg = organizations[0];
  const workspace = mockPersonalWorkspace;

  const targetOrgHref = (primaryOrg ? `/home/${primaryOrg.slug}` : "/home/organizations") as Route;
  const targetOrgLabel = primaryOrg ? `Open ${primaryOrg.name}` : "Manage organizations";

  return (
    <div className="space-y-10">
      <section className="flex flex-col justify-between gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            {workspace.dateLabel}
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em] sm:text-5xl">
            {workspace.greeting}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{workspace.description}</p>
        </div>
        <Link
          href={targetOrgHref}
          className="inline-flex h-9 items-center gap-2 border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
        >
          {targetOrgLabel} <ArrowUpRight className="size-3.5" />
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {workspace.stats.map(({ label, value, note, tone }, index) => {
          const Icon = index === 0 ? CircleDot : index === 1 ? Clock3 : Check;

          return (
            <div key={label} className="border border-border/70 bg-background p-5">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                  {label}
                </p>
                <Icon className={`size-4 ${tone}`} strokeWidth={1.5} />
              </div>
              <p className="mt-8 text-4xl font-medium tracking-[-0.07em]">{value}</p>
              <p className="mt-2 text-xs text-muted-foreground">{note}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="border border-border/70 bg-background">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                Your projects
              </p>
              <h2 className="mt-1 text-sm font-medium">A short list with a long view</h2>
            </div>
            <Link
              href={targetOrgHref}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border/70">
            {workspace.projects.map((project) => (
              <div
                key={project.id}
                className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 size-2 rounded-full ${project.color}`} />
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{project.team}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:min-w-40">
                  <div className="h-1 flex-1 bg-muted">
                    <div
                      className={`h-1 ${project.color}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {project.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border/70 bg-foreground p-5 text-background">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.16em] text-background/55 uppercase">
              Small ritual
            </p>
            <Plus className="size-4 text-background/55" />
          </div>
          <h2 className="mt-16 max-w-xs text-2xl font-medium leading-tight tracking-tighter">
            {workspace.ritual.title}
          </h2>
          <p className="mt-4 max-w-xs text-xs leading-6 text-background/55">
            {workspace.ritual.description}
          </p>
          <div className="mt-10 border-t border-background/20 pt-4 font-mono text-[10px] text-background/55">
            2 minutes / no ceremony
          </div>
        </div>
      </section>
    </div>
  );
}
