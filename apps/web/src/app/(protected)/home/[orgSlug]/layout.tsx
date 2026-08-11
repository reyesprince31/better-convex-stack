import { Suspense } from "react";

import {
  ProtectedShellSkeleton,
  WorkspaceSidebarLayout,
} from "@/components/workspace/workspace-sidebar-layout";

export default function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  return (
    <Suspense fallback={<ProtectedShellSkeleton />}>
      <OrganizationLayoutContent params={params}>{children}</OrganizationLayoutContent>
    </Suspense>
  );
}

async function OrganizationLayoutContent({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return (
    <WorkspaceSidebarLayout kind="organization" orgSlug={orgSlug}>
      {children}
    </WorkspaceSidebarLayout>
  );
}
