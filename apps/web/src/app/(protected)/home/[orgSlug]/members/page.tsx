import { Users } from "lucide-react";
import { use } from "react";

import { OrganizationResourcePage } from "@/components/organization/organization-resource-page";
import { getMockOrganization } from "@/lib/mock-workspace";

export default function OrganizationMembersPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const organization = getMockOrganization(use(params).orgSlug);

  return (
    <OrganizationResourcePage organization={organization} title="People" description="See who is contributing to this workspace and where they focus." icon={Users}>
      <div className="grid gap-3 sm:grid-cols-2">
        {organization.members.map((member) => (
          <div key={member.name} className="flex items-center gap-3 border border-border/70 bg-background p-4"><span className="flex size-9 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">{member.initials}</span><div><p className="text-sm font-medium">{member.name}</p><p className="mt-1 text-xs text-muted-foreground">{member.role}</p></div></div>
        ))}
      </div>
    </OrganizationResourcePage>
  );
}
