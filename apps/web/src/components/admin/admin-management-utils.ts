export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  createdAt: Date | number | string;
};

export type UserRole = "admin" | "user";

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  createdAt: number;
  memberCount: number;
  ownerUserId: string | null;
};

export type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: number;
};

export type OrganizationRole = "owner" | "admin" | "member";

export type UserDialogState =
  | { mode: "create" }
  | { mode: "edit"; userId: string }
  | { mode: "delete"; userId: string };

export type OrganizationDialogState =
  | { mode: "create" }
  | { mode: "edit"; organizationId: string }
  | { mode: "add-member" }
  | { mode: "delete-organization"; organizationId: string }
  | { mode: "delete-member"; memberId: string };

export type UserFormValues = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type OrganizationFormValues = {
  name: string;
  slug: string;
  ownerUserId: string;
};

export type AddMemberFormValues = {
  userId: string;
  role: OrganizationRole;
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

export function formatDate(value: Date | number | string) {
  return new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function userLabel(user: AdminUser | undefined) {
  return user ? `${user.name} / ${user.email}` : "Unknown member";
}
