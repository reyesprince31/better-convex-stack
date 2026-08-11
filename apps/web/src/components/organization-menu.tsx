"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@better-convex-stack/ui/components/dropdown-menu";
import { Building2, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { mockOrganizations } from "@/lib/mock-workspace";

export function OrganizationMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 text-muted-foreground hover:text-foreground"
          />
        }
      >
        Organization
        <ChevronDown className="size-3.5" />
        <span className="sr-only">Show organizations</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          {mockOrganizations.map((organization) => (
            <DropdownMenuItem
              key={organization.slug}
              render={<Link href={`/home/${organization.slug}` as Route} />}
              className="gap-3 py-2.5"
            >
              <span className="flex size-7 shrink-0 items-center justify-center bg-muted">
                <Building2 className="size-3.5 text-muted-foreground" />
              </span>
              <span className="grid flex-1 text-left">
                <span className="text-xs font-medium">{organization.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {organization.plan} plan / {organization.memberCount} members
                </span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
