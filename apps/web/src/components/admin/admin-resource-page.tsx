import { ArrowUpRight, Search, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@better-convex-stack/ui/components/card";

export function AdminResourcePage({
  title,
  description,
  icon: Icon,
  rows,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  rows: readonly { name: string; detail: string; status: string }[];
}) {
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Administration
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em]">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        </div>
        <Link
          href={"/admin/overview" as Route}
          className="inline-flex h-9 items-center gap-2 border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
        >
          Overview <ArrowUpRight className="size-3.5" />
        </Link>
      </section>
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon className="size-4 text-muted-foreground" strokeWidth={1.5} /> Current{" "}
              {title.toLowerCase()}
            </CardTitle>
            <CardDescription className="mt-1">
              A mock management surface ready for Convex queries.
            </CardDescription>
          </div>
          <div className="hidden items-center gap-2 border border-border px-2.5 py-1.5 text-xs text-muted-foreground sm:flex">
            <Search className="size-3.5" /> Filter
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/70 border-t border-border/70">
            {rows.map((row) => (
              <div
                key={row.name}
                className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
              >
                <p className="text-sm font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.detail}</p>
                <span className="font-mono text-[10px] tracking-[0.12em] text-emerald-600 uppercase dark:text-emerald-400">
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
