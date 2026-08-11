import Link from "next/link";

import UserMenu from "@/components/user-menu";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";

export function PersonalHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link
            href="/home"
            className="flex items-center gap-3"
            aria-label="Orbit personal workspace"
          >
            <span className="flex size-7 items-center justify-center bg-foreground text-[10px] font-semibold tracking-[-0.12em] text-background">
              or
            </span>
            <span className="font-mono text-xs font-semibold tracking-[0.2em] uppercase">
              Personal
            </span>
          </Link>
          <nav
            className="hidden items-center gap-6 text-xs text-muted-foreground md:flex"
            aria-label="Personal workspace navigation"
          >
            <Link href="/home" className="transition-colors hover:text-foreground">
              Overview
            </Link>
            <Link href="/home/acme-labs" className="transition-colors hover:text-foreground">
              Acme Labs
            </Link>
            <Link href="/home/settings" className="transition-colors hover:text-foreground">
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <WorkspaceSwitcher compact />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
