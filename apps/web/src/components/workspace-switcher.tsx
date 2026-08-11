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
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";

import { mockOrganizations } from "@/lib/mock-workspace";

export const workspaceOptions = [
  { href: "/home", label: "Personal", detail: "Your private workspace", icon: CircleUserRound },
  ...mockOrganizations.map((organization) => ({
    href: `/home/${organization.slug}`,
    label: organization.name,
    detail: `${organization.memberCount} members / ${organization.plan}`,
    icon: Building2,
  })),
] as const;

export function WorkspaceSwitcher({ className }: { className?: string } = {}) {
  const pathname = usePathname();
  const router = useRouter();
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
        render={<Button variant="outline" size="sm" className={`gap-2 ${className ?? ""}`} />}
      >
        <CurrentIcon className="size-3.5" />
        <span>{current.label}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
        <span className="sr-only">Switch workspace</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
          {workspaceOptions.map((workspace) => {
            const Icon = workspace.icon;
            const isCurrent = workspace.href === current.href;

            return (
              <DropdownMenuItem
                key={workspace.href}
                onClick={() => router.push(workspace.href as Route)}
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
