import { Suspense } from "react";

import { ProtectedShellSkeleton } from "@/components/workspace/workspace-sidebar-layout";
import { requireAuth } from "@/lib/require-auth";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ProtectedShellSkeleton />}>
      <ProtectedContent>{children}</ProtectedContent>
    </Suspense>
  );
}

async function ProtectedContent({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return children;
}
