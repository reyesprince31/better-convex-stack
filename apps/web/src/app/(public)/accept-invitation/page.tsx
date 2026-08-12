import { Suspense } from "react";

import { AcceptInvitationView } from "@/components/organization/accept-invitation-view";

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<InvitationPageLoading />}>
      <AcceptInvitationView />
    </Suspense>
  );
}

function InvitationPageLoading() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-2xl items-center justify-center px-5 py-16 sm:px-8">
      <div className="w-full border border-border/70 bg-background p-6 sm:p-8">
        <div className="h-10 w-10 animate-pulse bg-muted" />
        <div className="mt-7 h-3 w-40 animate-pulse bg-muted" />
        <div className="mt-3 h-10 w-72 max-w-full animate-pulse bg-muted" />
        <div className="mt-4 h-4 w-full max-w-lg animate-pulse bg-muted" />
      </div>
    </main>
  );
}
