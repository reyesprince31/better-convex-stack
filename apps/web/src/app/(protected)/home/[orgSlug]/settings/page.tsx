import { Settings2 } from "lucide-react";
import { use } from "react";

import { OrganizationResourcePage } from "@/components/organization/organization-resource-page";
import { getMockOrganization } from "@/lib/mock-workspace";

export default function OrganizationSettingsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const organization = getMockOrganization(use(params).orgSlug);

  return (
    <OrganizationResourcePage organization={organization} title="Settings" description="The settings surface for this organization is ready for Convex-backed forms." icon={Settings2}>
      <div className="divide-y divide-border/70 border-y border-border/70 bg-background">
        {["Workspace profile", "Member permissions", "Billing and plan"].map((setting) => <div key={setting} className="flex items-center justify-between px-5 py-5"><div><p className="text-sm font-medium">{setting}</p><p className="mt-1 text-xs text-muted-foreground">Mock settings surface for {organization.name}.</p></div><span className="font-mono text-[10px] text-muted-foreground">Soon</span></div>)}
      </div>
    </OrganizationResourcePage>
  );
}
