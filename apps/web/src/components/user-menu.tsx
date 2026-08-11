"use client";

import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { Button } from "@better-convex-stack/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@better-convex-stack/ui/components/dropdown-menu";
import { useQuery } from "convex/react";
import { ChevronDown, Home, LogOut, Settings2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const pathname = usePathname();
  const user = useQuery(api.auth.getCurrentUser);
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Account";
  const isAdminPanel = pathname === "/admin" || pathname.startsWith("/admin/");
  const contextLink = isAdminPanel
    ? { href: "/home" as Route, label: "Home", icon: Home }
    : user?.role === "admin"
      ? { href: "/admin/overview" as Route, label: "Admin console", icon: ShieldCheck }
      : null;
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-9 gap-2 px-2" aria-label="Open account menu" />
        }
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
          {initials}
        </span>
        <span className="hidden max-w-24 truncate text-xs sm:inline">{displayName}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="py-3">
            <p className="font-medium text-foreground">{displayName}</p>
            <p className="mt-1 truncate text-[11px]">{user?.email ?? "Signed-in account"}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {contextLink ? (
          <>
            <DropdownMenuItem render={<Link href={contextLink.href} />}>
              <contextLink.icon />
              {contextLink.label}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem render={<Link href="/home/settings" />}>
          <Settings2 />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.replace("/sign-in");
                },
              },
            });
          }}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
