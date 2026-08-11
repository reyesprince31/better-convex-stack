import { ArrowUpRight, BriefcaseBusiness, Command, LayoutDashboard, Settings2, ShieldCheck } from "lucide-react";
import Link from "next/link";

import UserMenu from "@/components/user-menu";

const workspaceLinks = [
  { href: "/home", label: "Overview", icon: LayoutDashboard },
  { href: "/home", label: "Personal", icon: BriefcaseBusiness },
  { href: "/home/acme-labs", label: "Acme Labs", icon: Command },
] as const;

export function SaaSShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-muted/30 lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden border-r border-border/70 bg-background lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-border/70 px-6">
          <Link href="/home" className="flex items-center gap-3" aria-label="Orbit workspace home">
            <span className="flex size-7 items-center justify-center bg-foreground text-[10px] font-semibold tracking-[-0.12em] text-background">
              or
            </span>
            <span className="font-mono text-xs font-semibold tracking-[0.2em] uppercase">Orbit</span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <p className="mb-3 px-3 font-mono text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Workspace
            </p>
            <nav className="grid gap-1" aria-label="Workspace navigation">
              {workspaceLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  prefetch
                  className="group flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" strokeWidth={1.5} />
                  <span>{label}</span>
                  {label === "Acme Labs" ? (
                    <span className="ml-auto size-1.5 rounded-full bg-emerald-500" />
                  ) : null}
                </Link>
              ))}
            </nav>
            <p className="mb-3 mt-8 px-3 font-mono text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Manage
            </p>
            <nav className="grid gap-1" aria-label="Management navigation">
              <Link
                href="/admin"
                prefetch
                className="group flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ShieldCheck className="size-4" strokeWidth={1.5} />
                <span>Admin console</span>
              </Link>
              <Link
                href="/home/settings"
                prefetch
                className="group flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Settings2 className="size-4" strokeWidth={1.5} />
                <span>Settings</span>
              </Link>
            </nav>
          </div>
          <div className="border-t border-border/70 pt-4">
            <Link
              href="/blog"
              className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>Read the journal</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="flex size-7 items-center justify-center bg-foreground text-[10px] font-semibold tracking-[-0.12em] text-background">
              or
            </span>
            <span className="font-mono text-xs font-semibold tracking-[0.2em] uppercase">Orbit</span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>All systems operational</span>
          </div>
          <UserMenu />
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

export function ProtectedShellSkeleton() {
  return (
    <div className="min-h-svh bg-muted/30 lg:grid lg:grid-cols-[248px_1fr]">
      <div className="hidden border-r border-border/70 bg-background lg:block" />
      <div className="p-5 sm:p-8">
        <div className="h-4 w-36 animate-pulse bg-muted" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="h-32 animate-pulse bg-muted" />
          <div className="h-32 animate-pulse bg-muted" />
          <div className="h-32 animate-pulse bg-muted" />
        </div>
      </div>
    </div>
  );
}
