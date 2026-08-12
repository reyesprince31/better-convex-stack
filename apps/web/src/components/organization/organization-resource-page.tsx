import { ArrowUpRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type * as React from "react";

export function OrganizationResourcePage({
  organization,
  title,
  description,
  icon: Icon,
  children,
}: {
  organization: { name: string; slug: string };
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            <Icon className="size-3.5" /> {organization.name} / workspace
          </div>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em]">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        </div>
        <Link
          href={`/home/${organization.slug}`}
          className="inline-flex h-9 items-center gap-2 border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
        >
          Overview <ArrowUpRight className="size-3.5" />
        </Link>
      </section>
      {children}
    </div>
  );
}
