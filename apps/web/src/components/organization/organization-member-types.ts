import type { authClient } from "@/lib/auth-client";

type ActiveOrganization = NonNullable<
  ReturnType<typeof authClient.useActiveOrganization>["data"]
>;

export type OrganizationMember = ActiveOrganization["members"][number];
export type OrganizationInvitation = ActiveOrganization["invitations"][number];

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts.at(-1)?.[0]}`.toUpperCase();
  }

  return name.trim().slice(0, 2).toUpperCase() || "MB";
}

export function hasOrganizationRole(role: string, expectedRole: string) {
  return role
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(expectedRole);
}

export function formatOrganizationRole(role: string) {
  return role
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(", ");
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = error.message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
}
