import { Suspense } from "react";

import { OrganizationMembersView } from "@/components/organization/organization-members-view";

export default function OrganizationMembersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  return (
    <Suspense fallback={<MembersPageLoading />}>
      <OrganizationMembersContent params={params} />
    </Suspense>
  );
}

async function OrganizationMembersContent({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <OrganizationMembersView orgSlug={orgSlug} />;
}

function MembersPageLoading() {
  return (
    <div className="space-y-8" aria-label="Loading organization members">
      <section className="space-y-3 border-b border-border/70 pb-8">
        <div className="h-3 w-44 animate-pulse bg-muted" />
        <div className="h-12 w-64 animate-pulse bg-muted" />
        <div className="h-4 w-[30rem] max-w-full animate-pulse bg-muted" />
      </section>
      <div className="h-24 animate-pulse bg-muted" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <div className="h-80 animate-pulse bg-muted" />
        <div className="h-80 animate-pulse bg-muted" />
      </div>
    </div>
  );
}
