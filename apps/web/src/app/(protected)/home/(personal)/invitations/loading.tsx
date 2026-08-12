import { Skeleton } from "@better-convex-stack/ui/components/skeleton";

export default function InvitationsLoading() {
  return (
    <div className="space-y-8" aria-label="Loading invitations">
      <section className="space-y-3 border-b border-border/70 pb-8">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </section>
      <section className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </section>
    </div>
  );
}
