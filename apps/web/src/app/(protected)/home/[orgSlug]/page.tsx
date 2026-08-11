import { OrganizationOverview } from "@/components/organization/organization-overview";

export default async function OrganizationHomePage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;

  return <OrganizationOverview orgSlug={orgSlug} />;
}
