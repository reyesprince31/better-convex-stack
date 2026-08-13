"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import {
  Archive,
  ArrowUpRight,
  CreditCard,
  Download,
  FileArchive,
  ReceiptText,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { SettingsPanel, SettingsToggle } from "@/components/shared/settings-ui";
import { mockOrganizationInvoices } from "@/lib/mock-workspace";

import {
  organizationNotificationPreferences,
  type OrganizationNotificationId,
  type OrganizationNotificationSettings,
} from "./organization-settings-data";

export function OrganizationGeneralPanel({
  name,
  slug,
  memberCount,
  role,
  canManage,
  onEdit,
}: {
  name: string;
  slug: string;
  memberCount: number;
  role: string;
  canManage: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-5">
      <SettingsPanel
        title="Workspace identity"
        description="The name and URL your team sees across navigation and invitations."
        action={
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg"
            disabled={!canManage}
            onClick={onEdit}
          >
            Edit workspace
          </Button>
        }
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="bg-muted/55 p-4">
            <dt className="text-[11px] font-medium text-muted-foreground">Workspace name</dt>
            <dd className="mt-2 text-sm font-semibold">{name}</dd>
          </div>
          <div className="bg-muted/55 p-4">
            <dt className="text-[11px] font-medium text-muted-foreground">Workspace URL</dt>
            <dd className="mt-2 truncate font-mono text-xs">/home/{slug}</dd>
          </div>
        </dl>
        {!canManage ? (
          <p className="mt-4 text-[11px]/relaxed text-muted-foreground">
            Your {role || "member"} role can view these settings. An owner or admin can edit them.
          </p>
        ) : null}
      </SettingsPanel>

      <SettingsPanel
        title="Members and access"
        description="Invite teammates, assign roles, and review pending invitations on the members page."
        action={
          <Button
            variant="outline"
            className="h-9 rounded-lg"
            render={<Link href={`/home/${slug}/members` as Route} />}
          >
            Manage members
            <ArrowUpRight />
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border border-border/70 p-4 sm:col-span-2">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
                <Users className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {memberCount === 1 ? "1 connected member" : `${memberCount} connected members`}
                </p>
                <p className="mt-1 text-xs/relaxed text-muted-foreground">
                  Member roles are enforced by Better Auth on every management action.
                </p>
              </div>
            </div>
          </div>
          <div className="border border-border/70 p-4">
            <ShieldCheck className="size-4 text-muted-foreground" />
            <p className="mt-3 text-[11px] text-muted-foreground">Your role</p>
            <p className="mt-1 text-sm font-semibold capitalize">{role || "Member"}</p>
          </div>
        </div>
      </SettingsPanel>
    </div>
  );
}

export function OrganizationBillingPanel({
  plan,
  memberCount,
  canManage,
  onMockAction,
}: {
  plan: string;
  memberCount: number;
  canManage: boolean;
  onMockAction: (label: string) => void;
}) {
  const seatLimit = plan.toLowerCase() === "free" ? 5 : 20;
  const seatPercentage = Math.min(100, Math.round((memberCount / seatLimit) * 100));

  return (
    <div className="space-y-5">
      <SettingsPanel
        title="Plan and usage"
        description="A provider-ready billing surface with clearly labeled sample data."
        action={
          <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
            Sample billing data
          </span>
        }
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(15rem,0.75fr)]">
          <div className="bg-primary p-5 text-primary-foreground">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-primary-foreground/70">Current plan</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{plan}</p>
                <p className="mt-1 text-xs text-primary-foreground/70">
                  Billing provider not connected
                </p>
              </div>
              <CreditCard className="size-5" />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-6 h-9 rounded-lg"
              disabled={!canManage}
              onClick={() => onMockAction("Plan management")}
            >
              Manage plan
            </Button>
          </div>

          <div className="border border-border/70 p-5">
            <p className="text-xs font-medium text-muted-foreground">Seats used</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-semibold tracking-[-0.05em]">{memberCount}</span>
              <span className="pb-1 text-xs text-muted-foreground">of {seatLimit}</span>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${seatPercentage}%` }}
              />
            </div>
            <p className="mt-3 text-[11px]/relaxed text-muted-foreground">
              Seat totals use live organization membership. Limits are sample plan data.
            </p>
          </div>
        </div>
      </SettingsPanel>

      <SettingsPanel
        title="Payment method"
        description="Connect Stripe or another provider to replace this empty state."
        action={
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg"
            disabled={!canManage}
            onClick={() => onMockAction("Payment method management")}
          >
            Add payment method
          </Button>
        }
      >
        <div className="flex items-center gap-3 border border-dashed border-border p-4">
          <div className="flex size-10 shrink-0 items-center justify-center bg-muted">
            <CreditCard className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No billing provider connected</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No card or payment details are stored by this boilerplate.
            </p>
          </div>
        </div>
      </SettingsPanel>

      <SettingsPanel
        title="Invoice history"
        description="Preview rows show the final geometry for provider-backed receipts."
      >
        <div className="overflow-hidden border border-border/70">
          <div className="divide-y divide-border/70">
            {mockOrganizationInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_8rem_6rem_2.5rem] sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <ReceiptText className="size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-mono text-xs font-medium">{invoice.id}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">Preview invoice</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{invoice.date}</p>
                <div className="flex items-center justify-between gap-3 sm:block">
                  <span className="text-xs font-medium tabular-nums">{invoice.amount}</span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:hidden">
                    {invoice.status}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label={`Download ${invoice.id}`}
                  onClick={() => onMockAction(`Download ${invoice.id}`)}
                >
                  <Download />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </SettingsPanel>
    </div>
  );
}

export function OrganizationNotificationsPanel({
  settings,
  canManage,
  onToggle,
  onSave,
}: {
  settings: OrganizationNotificationSettings;
  canManage: boolean;
  onToggle: (id: OrganizationNotificationId, checked: boolean) => void;
  onSave: () => void;
}) {
  return (
    <SettingsPanel
      title="Workspace notifications"
      description="Choose which organization events should reach workspace administrators."
      footer={
        <>
          {!canManage ? (
            <p className="mr-auto text-[11px] text-muted-foreground">
              Only owners and admins can change workspace notifications.
            </p>
          ) : null}
          <Button
            type="button"
            className="h-9 rounded-lg px-4"
            disabled={!canManage}
            onClick={onSave}
          >
            Save preferences
          </Button>
        </>
      }
    >
      <div className="divide-y divide-border/70 overflow-hidden border border-border/70">
        {organizationNotificationPreferences.map((preference) => (
          <div key={preference.id} className="flex items-center justify-between gap-4 px-4 py-4">
            <div>
              <p className="text-sm font-medium">{preference.title}</p>
              <p className="mt-1 text-xs/relaxed text-muted-foreground">{preference.description}</p>
            </div>
            <SettingsToggle
              id={`organization-${preference.id}`}
              checked={settings[preference.id]}
              disabled={!canManage || preference.id === "billing-events"}
              label={preference.title}
              onChange={(checked) => onToggle(preference.id, checked)}
            />
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px]/relaxed text-muted-foreground">
        Billing events stay enabled. Preferences are stored in this browser until a backend model is
        added.
      </p>
    </SettingsPanel>
  );
}

export function OrganizationAdvancedPanel({
  slug,
  canManage,
  canDelete,
  onMockAction,
  onDelete,
}: {
  slug: string;
  canManage: boolean;
  canDelete: boolean;
  onMockAction: (label: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-5">
      <SettingsPanel
        title="Data portability"
        description="Keep export and import capabilities visible before a project needs them."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border border-border/70 p-4">
            <FileArchive className="size-4 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Export workspace</p>
            <p className="mt-1 text-xs/relaxed text-muted-foreground">
              Prepare projects, members, and settings as a portable archive.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 h-9 rounded-lg"
              disabled={!canManage}
              onClick={() => onMockAction("Workspace export")}
            >
              <Download />
              Request export
            </Button>
          </div>
          <div className="border border-border/70 p-4">
            <Archive className="size-4 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Import data</p>
            <p className="mt-1 text-xs/relaxed text-muted-foreground">
              Add a dry-run import flow when the product has a stable data contract.
            </p>
            <Button type="button" variant="outline" className="mt-4 h-9 rounded-lg" disabled>
              Import unavailable
            </Button>
          </div>
        </div>
      </SettingsPanel>

      <SettingsPanel
        title="Danger zone"
        description="Permanently remove this organization and its Better Auth membership records."
        tone="danger"
        footer={
          <Button
            type="button"
            variant="destructive"
            className="h-9 rounded-lg"
            disabled={!canDelete}
            onClick={onDelete}
          >
            <Trash2 />
            Delete organization
          </Button>
        }
      >
        <div className="flex items-start gap-3 bg-destructive/5 p-4">
          <Trash2 className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium">Deletion requires typed confirmation</p>
            <p className="mt-1 text-xs/relaxed text-muted-foreground">
              Type {slug} in the confirmation dialog before this organization can be deleted.
              {!canDelete ? " Only the organization owner can complete this action." : ""}
            </p>
          </div>
        </div>
      </SettingsPanel>
    </div>
  );
}
