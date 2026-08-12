import { Suspense } from "react";

import { OrganizationOverview } from "@/components/organization/organization-overview";

export default function OrganizationHomePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  return (
    <Suspense fallback={<OrganizationHomePageLoading />}>
      <OrganizationHomeContent params={params} />
    </Suspense>
  );
}

async function OrganizationHomeContent({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <OrganizationOverview orgSlug={orgSlug} />;
}

function OrganizationHomePageLoading() {
  return (
    <div className="space-y-10" aria-label="Loading organization workspace">
      <div className="space-y-3 border-b border-border/70 pb-8">
        <div className="h-3 w-44 animate-pulse bg-muted" />
        <div className="h-12 w-64 animate-pulse bg-muted" />
        <div className="h-4 w-[30rem] max-w-full animate-pulse bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 animate-pulse bg-muted" />
        <div className="h-32 animate-pulse bg-muted" />
        <div className="h-32 animate-pulse bg-muted" />
      </div>
    </div>
  );
}
