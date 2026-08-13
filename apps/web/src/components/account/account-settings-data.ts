import { Bell, CircleUserRound, ShieldCheck, TriangleAlert, Wrench } from "lucide-react";

export const DELETE_CONFIRMATION = "delete my account";
export const NOTIFICATION_STORAGE_KEY = "starter-kit:account-notifications:v1";

export type AccountTab = "profile" | "security" | "notifications" | "advanced" | "danger";

export const accountTabs = [
  { id: "profile", label: "Profile", icon: CircleUserRound },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "advanced", label: "Advanced", icon: Wrench },
  { id: "danger", label: "Danger zone", icon: TriangleAlert },
] as const;

export const notificationPreferences = [
  {
    id: "product-updates",
    title: "Product updates",
    description: "New features, improvements, and maintenance notes.",
    emailRequired: false,
  },
  {
    id: "security-alerts",
    title: "Security alerts",
    description: "New sign-ins, password changes, and recovery events.",
    emailRequired: true,
  },
  {
    id: "billing-emails",
    title: "Billing emails",
    description: "Invoices, receipts, and failed payment notices.",
    emailRequired: true,
  },
  {
    id: "weekly-digest",
    title: "Weekly digest",
    description: "A short summary of activity across your workspaces.",
    emailRequired: false,
  },
] as const;

export type NotificationId = (typeof notificationPreferences)[number]["id"];
export type NotificationChannels = { email: boolean; inApp: boolean };
export type NotificationSettings = Record<NotificationId, NotificationChannels>;

export const defaultNotificationSettings: NotificationSettings = {
  "product-updates": { email: true, inApp: true },
  "security-alerts": { email: true, inApp: true },
  "billing-emails": { email: true, inApp: false },
  "weekly-digest": { email: true, inApp: false },
};

export function isAccountTab(value: string | null): value is AccountTab {
  return accountTabs.some((tab) => tab.id === value);
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (
    (parts.length > 1 ? parts[0][0] + parts.at(-1)?.[0] : parts[0]?.slice(0, 2)) || "AC"
  ).toUpperCase();
}
