import { Activity, ArrowUpRight, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

import { requireAdmin } from "@/lib/require-auth";

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <div className="space-y-10">
      <section className="flex flex-col justify-between gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end">
        <div><p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">Administration</p><h1 className="mt-3 text-4xl font-medium tracking-[-0.06em]">Admin console</h1><p className="mt-3 text-sm text-muted-foreground">Manage access, organizations, and the health of the workspace.</p></div>
        <Link href="/home" className="inline-flex h-9 items-center gap-2 border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted">Back to workspace <ArrowUpRight className="size-3.5" /></Link>
      </section>
      <div className="border border-emerald-500/25 bg-emerald-500/5 p-5 text-sm"><div className="flex items-center gap-2 font-medium"><ShieldCheck className="size-4 text-emerald-500" /> Admin access confirmed</div><p className="mt-2 text-xs text-muted-foreground">Signed in as {user?.email ?? "the current admin"}. This surface is backed by the Better Auth admin plugin.</p></div>
      <section className="grid gap-4 md:grid-cols-3">
        {[{ label: "Active members", value: "48", icon: Users }, { label: "Organizations", value: "06", icon: ShieldCheck }, { label: "System health", value: "99.9%", icon: Activity }].map(({ label, value, icon: Icon }) => <div key={label} className="border border-border/70 bg-background p-5"><Icon className="size-4 text-muted-foreground" strokeWidth={1.5} /><p className="mt-8 text-4xl font-medium tracking-[-0.07em]">{value}</p><p className="mt-2 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">{label}</p></div>)}
      </section>
    </div>
  );
}
