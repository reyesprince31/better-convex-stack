import Link from "next/link";

import { ModeToggle } from "@/components/theme/mode-toggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/home", label: "Dashboard" },
] as const;

export default function Header() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}
