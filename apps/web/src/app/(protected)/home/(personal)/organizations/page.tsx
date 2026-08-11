import { ArrowUpRight, Building2, Plus } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { Button } from "@better-convex-stack/ui/components/button";

import { mockOrganizations } from "@/lib/mock-workspace";

export default function OrganizationsPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Personal workspace
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em]">Organizations</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage the teams and workspaces connected to your account.
          </p>
        </div>
        <Button type="button" className="h-9 gap-2 px-3">
          <Plus className="size-3.5" />
          Add organization
        </Button>
      </section>

      <div className="overflow-x-auto border border-border/70 bg-background">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">Organizations connected to your account</caption>
          <thead className="border-b border-border/70 bg-muted/30">
            <tr>
              <th
                scope="col"
                className="px-5 py-3 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase"
              >
                Organization
              </th>
              <th
                scope="col"
                className="px-5 py-3 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase"
              >
                Plan
              </th>
              <th
                scope="col"
                className="px-5 py-3 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase"
              >
                Members
              </th>
              <th
                scope="col"
                className="px-5 py-3 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase"
              >
                Projects
              </th>
              <th scope="col" className="px-5 py-3">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {mockOrganizations.map((organization) => (
              <tr key={organization.slug} className="transition-colors hover:bg-muted/30">
                <td className="px-5 py-4">
                  <Link
                    href={`/home/${organization.slug}` as Route}
                    className="flex items-center gap-3"
                  >
                    <span className="flex size-8 items-center justify-center bg-foreground text-background">
                      <Building2 className="size-4" />
                    </span>
                    <span className="grid">
                      <span className="font-medium">{organization.name}</span>
                      <span className="mt-0.5 text-xs text-muted-foreground">
                        /{organization.slug}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-4 text-xs text-muted-foreground">{organization.plan}</td>
                <td className="px-5 py-4 text-xs text-muted-foreground">
                  {organization.memberCount}
                </td>
                <td className="px-5 py-4 text-xs text-muted-foreground">
                  {organization.activeProjects} active
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/home/${organization.slug}` as Route}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Open <ArrowUpRight className="size-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
