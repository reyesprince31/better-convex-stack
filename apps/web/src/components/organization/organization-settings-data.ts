import { Bell, Building2, CreditCard, Wrench } from "lucide-react";

export type OrganizationSettingsTab = "general" | "billing" | "notifications" | "advanced";

export const organizationSettingsTabs = [
  { id: "general", label: "General", icon: Building2 },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "advanced", label: "Advanced", icon: Wrench },
] as const;

export function isOrganizationSettingsTab(value: string | null): value is OrganizationSettingsTab {
  return organizationSettingsTabs.some((tab) => tab.id === value);
}

export const organizationNotificationPreferences = [
  {
    id: "member-changes",
    title: "Member and role changes",
    description: "Invitations, removals, and permission updates.",
  },
  {
    id: "billing-events",
    title: "Billing events",
    description: "Receipts, payment failures, and plan changes.",
  },
  {
    id: "project-digest",
    title: "Workspace digest",
    description: "A weekly summary of project and member activity.",
  },
] as const;

export type OrganizationNotificationId = (typeof organizationNotificationPreferences)[number]["id"];
export type OrganizationNotificationSettings = Record<OrganizationNotificationId, boolean>;

export const defaultOrganizationNotifications: OrganizationNotificationSettings = {
  "member-changes": true,
  "billing-events": true,
  "project-digest": false,
};

export function getOrganizationNotificationStorageKey(organizationId: string) {
  return `starter-kit:organization:${organizationId}:notifications:v1`;
}
