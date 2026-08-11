import { use } from "react";

import { WorkspaceSidebarLayout } from "@/components/workspace/workspace-sidebar-layout";

export default function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = use(params);

  return (
    <WorkspaceSidebarLayout kind="organization" orgSlug={orgSlug}>
      {children}
    </WorkspaceSidebarLayout>
  );
}
