import Link from "next/link";

import { ModeToggle } from "@/components/theme/mode-toggle";

const links = [
  { href: "/blog", label: "Journal" },
  { href: "/#principles", label: "Principles" },
] as const;

export function PublicNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="Orbit home">
          <span className="flex size-8 items-center justify-center bg-foreground text-xs font-semibold tracking-[-0.12em] text-background transition-transform group-hover:rotate-6">
            or
          </span>
          <span className="font-mono text-xs font-semibold tracking-[0.22em] uppercase">Orbit</span>
        </Link>
        <nav className="hidden items-center gap-7 text-xs text-muted-foreground md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Link
            href="/sign-in"
            className="inline-flex h-8 items-center justify-center bg-foreground px-3 text-xs font-medium text-background transition-opacity hover:opacity-80"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
