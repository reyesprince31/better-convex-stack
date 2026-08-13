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
  Building2,
  Check,
  ChevronDown,
  Home,
  MailCheck,
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

const personalNavigation = [
  { href: "/home" as Route, label: "Overview", icon: Home },
  { href: "/home/organizations" as Route, label: "Organizations", icon: Building2 },
  { href: "/home/invitations" as Route, label: "Invitations", icon: MailCheck },
  { href: "/home/settings" as Route, label: "Settings", icon: Settings2 },
] as const;

export default function UserMenu({
  className,
  side = "right",
  align = "start",
  showIdentity = true,
  showPersonalNavigation = false,
}: {
  className?: string;
  side?: "bottom" | "left" | "right" | "top";
  align?: "center" | "end" | "start";
  showIdentity?: boolean;
  showPersonalNavigation?: boolean;
} = {}) {
  const pathname = usePathname();
  const user = useQuery(api.auth.getCurrentUser);
  const { setTheme, theme } = useTheme();

  if (!user) {
    return (
      <Button
        variant="ghost"
        size={showIdentity ? "lg" : "icon"}
        className={
          showIdentity
            ? `group h-12 w-full justify-start gap-3 px-2 ${className ?? ""}`
            : `group size-8 justify-center p-0 ${className ?? ""}`
        }
        disabled
        aria-label="Loading account"
      >
        <Skeleton className="size-8 rounded-full" />
        {showIdentity ? (
          <>
            <span className="grid min-w-0 flex-1 gap-1 text-left">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2.5 w-24" />
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </>
        ) : null}
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
            variant="ghost"
            size={showIdentity ? "lg" : "icon"}
            className={
              showIdentity
                ? `group h-12 w-full justify-start gap-3 px-2 ${className ?? ""}`
                : `group size-8 justify-center p-0 ${className ?? ""}`
            }
            aria-label={
              showPersonalNavigation ? "Open account and navigation menu" : "Open account menu"
            }
          />
        }
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
          {initials}
        </span>
        {showIdentity ? (
          <span className="grid min-w-0 flex-1 text-left leading-tight">
            <span className="max-w-28 truncate text-xs font-medium">{displayName}</span>
            <span className="max-w-36 truncate text-[10px] text-muted-foreground">
              {user?.email ?? "Signed-in account"}
            </span>
          </span>
        ) : null}
        {showIdentity ? (
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-popup-open:rotate-180" />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={side === "right" ? 8 : 4}
        className="w-64"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="py-3">
            <p className="font-medium text-foreground">{displayName}</p>
            <p className="mt-1 truncate text-[11px]">{user?.email ?? "Signed-in account"}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {showPersonalNavigation ? (
          <>
            <DropdownMenuGroup className="md:hidden">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              {personalNavigation.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/home"
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <DropdownMenuItem
                    key={item.href}
                    render={<Link href={item.href} />}
                    className={isActive ? "bg-accent text-accent-foreground" : undefined}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon />
                    {item.label}
                    {isActive ? <Check className="ml-auto size-3.5" /> : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="md:hidden" />
          </>
        ) : null}
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
        <DropdownMenuItem
          className={showPersonalNavigation ? "hidden md:flex" : undefined}
          render={<Link href="/home/invitations" />}
        >
          <MailCheck />
          Invitations
        </DropdownMenuItem>
        <DropdownMenuItem
          className={showPersonalNavigation ? "hidden md:flex" : undefined}
          render={<Link href="/home/settings" />}
        >
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
                  window.location.replace("/login");
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
