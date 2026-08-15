"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { Building2, ChevronRight } from "lucide-react";

import type { AdminUser, OrganizationSummary } from "./admin-management-utils";

type AdminOrganizationDirectoryProps = {
  organizations: OrganizationSummary[] | undefined;
  usersById: Map<string, AdminUser>;
  selectedOrganizationId: string | null;
  onSelect: (organizationId: string) => void;
  onEdit: (organization: OrganizationSummary) => void;
  onDelete: (organization: OrganizationSummary) => void;
};

export function AdminOrganizationDirectory({
  organizations,
  usersById,
  selectedOrganizationId,
  onSelect,
  onEdit,
  onDelete,
}: AdminOrganizationDirectoryProps) {
  return (
    <section
      className="border border-border/70 bg-background"
      aria-labelledby="organization-list-title"
    >
      <div className="border-b border-border/70 p-5 sm:p-6">
        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          Workspace directory
        </p>
        <h2 id="organization-list-title" className="mt-2 text-lg font-medium">
          {organizations
            ? `${organizations.length} organization${organizations.length === 1 ? "" : "s"}`
            : "Loading organizations"}
        </h2>
      </div>
      {organizations === undefined ? (
        <div className="space-y-px p-5">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-24 w-full" />
          ))}
        </div>
      ) : organizations.length === 0 ? (
        <div className="p-10 text-center">
          <Building2 className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No organizations yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Use the create action above after adding the first owner.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/70">
          {organizations.map((organization) => {
            const isSelected = organization.id === selectedOrganizationId;
            const owner = usersById.get(organization.ownerUserId ?? "");
            return (
              <div
                key={organization.id}
                className={`p-5 sm:p-6 ${isSelected ? "bg-muted/30" : ""}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    className="min-w-0 text-left"
                    onClick={() => onSelect(organization.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center border border-border bg-muted/40">
                        <Building2 className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {organization.name}
                        </span>
                        <span className="mt-1 block truncate font-mono text-[10px] text-muted-foreground">
                          /{organization.slug}
                        </span>
                      </span>
                    </div>
                  </button>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                      {organization.memberCount} member
                      {organization.memberCount === 1 ? "" : "s"}
                    </span>
                    <span className="hidden text-xs text-muted-foreground lg:inline">
                      Owner: {owner?.name ?? "Unknown"}
                    </span>
                    <Button
                      type="button"
                      variant={isSelected ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => onSelect(organization.id)}
                    >
                      Manage <ChevronRight />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(organization)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(organization)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
