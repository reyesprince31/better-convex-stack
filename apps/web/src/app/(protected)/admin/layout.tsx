import { Suspense } from "react";

import { AdminAccessGate } from "@/components/admin-access-gate";
import { WorkspaceSidebarLayout } from "@/components/workspace-sidebar-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceSidebarLayout kind="admin">
      <Suspense fallback={<AdminContentFallback />}>
        <AdminAccessGate>{children}</AdminAccessGate>
      </Suspense>
    </WorkspaceSidebarLayout>
  );
}

function AdminContentFallback() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-40 animate-pulse bg-muted" />
      <div className="h-10 w-64 animate-pulse bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 animate-pulse bg-muted" />
        <div className="h-32 animate-pulse bg-muted" />
        <div className="h-32 animate-pulse bg-muted" />
      </div>
    </div>
  );
}
