import type { authClient } from "@/lib/auth-client";

export type Organization = NonNullable<
  ReturnType<typeof authClient.useListOrganizations>["data"]
>[number];

export type MemberPreview = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  initials: string;
};

export type OrganizationMemberSummary = {
  organizationId: string;
  memberCount: number;
  members: MemberPreview[];
};

export type OrganizationDialogState =
  | { mode: "create" }
  | { mode: "edit"; organizationId: string }
  | { mode: "delete"; organizationId: string };

export type OrganizationFormValues = {
  name: string;
  slug: string;
};
