"use client";

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
import { Building2, Check, ChevronDown, CircleUserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

import { mockOrganizations } from "@/lib/mock-workspace";

export const workspaceOptions = [
  { href: "/home", label: "Personal", detail: "Private workspace", icon: CircleUserRound },
  ...mockOrganizations.map((organization) => ({
    href: `/home/${organization.slug}`,
    label: organization.name,
    detail: `${organization.plan} plan`,
    icon: Building2,
  })),
] as const;

export function WorkspaceSwitcher({
  className,
  compact = false,
  side = "bottom",
}: {
  className?: string;
  compact?: boolean;
  side?: "bottom" | "left" | "right" | "top";
} = {}) {
  const pathname = usePathname();
  const current =
    workspaceOptions.find((workspace) => {
      return workspace.href === "/home"
        ? pathname === workspace.href
        : pathname === workspace.href || pathname.startsWith(`${workspace.href}/`);
    }) ?? workspaceOptions[0];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant={compact ? "outline" : "ghost"}
            size={compact ? "sm" : "lg"}
            className={`group ${compact ? "h-9" : "h-12"} w-full justify-start gap-3 px-2 text-left ${className ?? ""}`}
            aria-label="Switch workspace"
          />
        }
      >
        <span
          className={`flex ${compact ? "size-6" : "size-8"} shrink-0 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground`}
        >
          <CurrentIcon className={compact ? "size-3.5" : "size-4"} />
        </span>
        <span className="grid min-w-0 flex-1 leading-tight">
          <span className="truncate text-xs font-medium">{current.label}</span>
          <span className="truncate text-[10px] text-muted-foreground">{current.detail}</span>
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-popup-open:rotate-180" />
        <span className="sr-only">Switch workspace</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side={side}
        sideOffset={side === "right" ? 8 : 4}
        className="w-64"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
          {workspaceOptions.map((workspace) => {
            const Icon = workspace.icon;
            const isCurrent = workspace.href === current.href;

            return (
              <DropdownMenuItem
                key={workspace.href}
                render={<Link href={workspace.href as Route} />}
                className="gap-3 py-2.5"
              >
                <Icon className="size-4 text-muted-foreground" />
                <span className="grid flex-1 text-left">
                  <span className="text-xs font-medium">{workspace.label}</span>
                  <span className="text-[10px] text-muted-foreground">{workspace.detail}</span>
                </span>
                {isCurrent ? <Check className="size-3.5 text-emerald-500" /> : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
