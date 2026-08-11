import { Suspense } from "react";

import { ProtectedShellSkeleton, SaaSShell } from "@/components/saas-shell";
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
  return <SaaSShell>{children}</SaaSShell>;
}
