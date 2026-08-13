import { Suspense } from "react";

import {
  OrganizationSettingsLoading,
  OrganizationSettingsView,
} from "@/components/organization/organization-settings-view";
import { getMockOrganization } from "@/lib/mock-workspace";

export default function OrganizationSettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  return (
    <Suspense fallback={<OrganizationSettingsLoading />}>
      <OrganizationSettingsContent params={params} />
    </Suspense>
  );
}

async function OrganizationSettingsContent({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const mockOrganization = getMockOrganization(orgSlug);

  return <OrganizationSettingsView orgSlug={orgSlug} plan={mockOrganization.plan} />;
}
