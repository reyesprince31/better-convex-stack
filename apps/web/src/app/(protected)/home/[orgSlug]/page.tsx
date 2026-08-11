import { ArrowUpRight, Check, CircleDot, Users } from "lucide-react";
import Link from "next/link";
import { use } from "react";

import { getMockOrganization, mockOrganizations } from "@/lib/mock-workspace";

export function generateStaticParams() {
  return mockOrganizations.map(({ slug: orgSlug }) => ({ orgSlug }));
}

export default function OrganizationHomePage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = use(params);
  const organization = getMockOrganization(orgSlug);

  return (
    <div className="space-y-10">
      <section className="flex flex-col justify-between gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase"><span className="size-1.5 rounded-full bg-emerald-500" /> Organization workspace</div>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em] sm:text-5xl">{organization.name}</h1>
          <p className="mt-3 text-sm text-muted-foreground">A shared view of priorities, projects, and the people moving them forward.</p>
        </div>
        <Link href="/home" className="inline-flex h-9 items-center gap-2 border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted">
          Personal view <ArrowUpRight className="size-3.5" />
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Active projects", value: String(organization.activeProjects), note: "4 in delivery" },
          { label: "Team members", value: String(organization.memberCount), note: "Across 3 circles" },
          { label: "This week", value: organization.momentum, note: "Momentum score" },
        ].map((stat) => (
          <div key={stat.label} className="border border-border/70 bg-background p-5">
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">{stat.label}</p>
            <p className="mt-8 text-4xl font-medium tracking-[-0.07em]">{stat.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{stat.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-border/70 bg-background">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">Team pulse</p>
              <h2 className="mt-1 text-sm font-medium">Work that is moving now</h2>
            </div>
            <CircleDot className="size-4 text-emerald-500" />
          </div>
          <div className="divide-y divide-border/70">
            {organization.projects.map((project, index) => (
              <div key={project.id} className="flex items-center gap-4 px-5 py-5">
                <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                <div className="flex-1"><p className="text-sm font-medium">{project.name}</p><p className="mt-1 text-xs text-muted-foreground">Due {project.due}</p></div>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className={`size-3.5 ${project.status === "On track" ? "text-emerald-500" : "text-amber-500"}`} /> {project.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-border/70 bg-background p-5">
          <div className="flex items-center justify-between"><p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">The circle</p><Users className="size-4 text-muted-foreground" strokeWidth={1.5} /></div>
          <p className="mt-8 text-4xl font-medium tracking-[-0.07em]">{organization.memberCount}</p>
          <p className="mt-2 text-xs text-muted-foreground">People creating momentum together.</p>
          <div className="mt-8 flex -space-x-2">
            {organization.members.map((member) => <span key={member.initials} title={`${member.name} — ${member.role}`} className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-foreground text-[10px] font-medium text-background">{member.initials}</span>)}
          </div>
        </div>
      </section>
    </div>
  );
}
