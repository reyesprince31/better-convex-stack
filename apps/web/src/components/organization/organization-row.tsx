"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@better-convex-stack/ui/components/avatar";
import { Button } from "@better-convex-stack/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@better-convex-stack/ui/components/dropdown-menu";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@better-convex-stack/ui/components/tooltip";
import { Check, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";

import { formatOrganizationDate } from "./organization-management-utils";
import type { Organization, OrganizationMemberSummary } from "./organization-management-types";

type OrganizationRowProps = {
  organization: Organization;
  isActive: boolean;
  membersSummary?: OrganizationMemberSummary;
  isLoadingMembers?: boolean;
  onEdit: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
};

function OrganizationMark({ name }: { name: string }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center bg-foreground text-background">
      <span className="font-mono text-[11px] font-semibold tracking-[-0.12em]">
        {name.slice(0, 2).toLowerCase()}
      </span>
    </span>
  );
}

export function OrganizationRow({
  organization,
  isActive,
  membersSummary,
  isLoadingMembers,
  onEdit,
  onDelete,
}: OrganizationRowProps) {
  const memberCount = membersSummary?.memberCount ?? 1;
  const members = membersSummary?.members ?? [];
  const overflowCount = membersSummary ? memberCount - members.length : 0;

  return (
    <div className="group flex flex-col gap-4 border-b border-border/70 px-5 py-5 last:border-b-0 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <OrganizationMark name={organization.name} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/home/${organization.slug}`}
              className="truncate text-sm font-medium transition-colors hover:text-primary"
            >
              {organization.name}
            </Link>
            {isActive ? (
              <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[9px] tracking-[0.12em] text-emerald-600 uppercase dark:text-emerald-400">
                <Check className="size-3" /> Active
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
            /{organization.slug}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 md:shrink-0 md:justify-end">
        <div className="flex items-center gap-3">
          {isLoadingMembers ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center -space-x-1.5">
                <Skeleton className="size-7 rounded-full" />
                <Skeleton className="size-7 rounded-full" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ) : members.length > 0 ? (
            <div className="flex items-center gap-2.5">
              <AvatarGroup>
                {members.map((member) => (
                  <Tooltip key={member.id}>
                    <TooltipTrigger>
                      <Avatar
                        size="sm"
                        className="cursor-pointer transition-transform hover:z-20 hover:scale-110"
                      >
                        {member.image ? <AvatarImage src={member.image} alt={member.name} /> : null}
                        <AvatarFallback className="text-[10px]">{member.initials}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="flex flex-col gap-0.5 px-2.5 py-1 text-xs"
                    >
                      <p className="font-medium text-background">{member.name}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-background/75">
                        <span className="capitalize">{member.role || "member"}</span>
                        {member.email ? <span>• {member.email}</span> : null}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {overflowCount > 0 ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar
                        size="sm"
                        className="cursor-pointer bg-muted text-muted-foreground transition-transform hover:z-20 hover:scale-110"
                      >
                        <AvatarFallback className="text-[10px] font-semibold">
                          +{overflowCount}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="px-2.5 py-1 text-xs">
                      <p className="font-medium text-background">
                        +{overflowCount} more {overflowCount === 1 ? "member" : "members"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </AvatarGroup>
              <span className="font-mono text-xs text-muted-foreground">
                {memberCount === 1 ? "1 member" : `${memberCount} members`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <Users className="size-3.5" />
              <span>1 member</span>
            </div>
          )}
        </div>

        <div className="hidden h-4 w-px bg-border/70 md:block" />
        <p className="text-xs text-muted-foreground">
          Created {formatOrganizationDate(organization.createdAt)}
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${organization.name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => onEdit(organization)}>
              <Pencil />
              Edit details
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(organization)}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
