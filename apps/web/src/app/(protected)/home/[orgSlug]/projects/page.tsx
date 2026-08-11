import { FolderKanban } from "lucide-react";
import { use } from "react";

import { OrganizationResourcePage } from "@/components/organization/organization-resource-page";
import { getMockOrganization } from "@/lib/mock-workspace";

export default function OrganizationProjectsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const organization = getMockOrganization(use(params).orgSlug);

  return (
    <OrganizationResourcePage organization={organization} title="Projects" description="A focused view of the work your team is moving forward." icon={FolderKanban}>
      <div className="divide-y divide-border/70 border-y border-border/70 bg-background">
        {organization.projects.map((project) => (
          <div key={project.id} className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div><p className="text-sm font-medium">{project.name}</p><p className="mt-1 text-xs text-muted-foreground">{project.team} / due {project.due}</p></div>
            <div className="flex items-center gap-3 sm:min-w-48"><div className="h-1 flex-1 bg-muted"><div className={`h-1 ${project.color}`} style={{ width: `${project.progress}%` }} /></div><span className="font-mono text-[10px] text-muted-foreground">{project.progress}%</span></div>
          </div>
        ))}
      </div>
    </OrganizationResourcePage>
  );
}
