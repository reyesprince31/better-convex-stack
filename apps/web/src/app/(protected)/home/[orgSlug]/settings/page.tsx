import { Suspense } from "react";
import { Settings2 } from "lucide-react";

import { OrganizationResourcePage } from "@/components/organization/organization-resource-page";
import { getMockOrganization } from "@/lib/mock-workspace";

export default function OrganizationSettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  return (
    <Suspense fallback={<SettingsPageLoading />}>
      <OrganizationSettingsContent params={params} />
    </Suspense>
  );
}

async function OrganizationSettingsContent({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const organization = getMockOrganization(orgSlug);

  return (
    <OrganizationResourcePage
      organization={organization}
      title="Settings"
      description="Workspace preferences and access settings."
      icon={Settings2}
    >
      <div className="divide-y divide-border/70 border-y border-border/70 bg-background">
        {["Workspace profile", "Member permissions", "Billing and plan"].map((setting) => (
          <div key={setting} className="flex items-center justify-between px-5 py-5">
            <div>
              <p className="text-sm font-medium">{setting}</p>
              <p className="mt-1 text-xs text-muted-foreground">Settings for {organization.name}.</p>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">Soon</span>
          </div>
        ))}
      </div>
    </OrganizationResourcePage>
  );
}

function SettingsPageLoading() {
  return <div className="h-96 animate-pulse bg-muted" aria-label="Loading settings" />;
}
