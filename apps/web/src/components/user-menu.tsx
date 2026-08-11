"use client";

import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { Button } from "@better-convex-stack/ui/components/button";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
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
import {
  Check,
  ChevronDown,
  Home,
  LogOut,
  Monitor,
  Moon,
  Settings2,
  ShieldCheck,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useTheme } from "next-themes";

import { authClient } from "@/lib/auth-client";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function UserMenu() {
  const pathname = usePathname();
  const user = useQuery(api.auth.getCurrentUser);
  const { setTheme, theme } = useTheme();

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2 px-2"
        disabled
        aria-label="Loading account"
      >
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="hidden h-3 w-14 sm:block" />
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </Button>
    );
  }

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
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 px-2"
            aria-label="Open account menu"
          />
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
        <DropdownMenuGroup>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          {themeOptions.map((option) => {
            const Icon = option.icon;

            return (
              <DropdownMenuItem key={option.value} onClick={() => setTheme(option.value)}>
                <Icon />
                {option.label}
                {theme === option.value ? (
                  <Check className="ml-auto size-3.5 text-emerald-500" />
                ) : null}
              </DropdownMenuItem>
            );
          })}
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
