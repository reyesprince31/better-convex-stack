import { Skeleton } from "@better-convex-stack/ui/components/skeleton";

export function OrganizationManagementLoading() {
  return (
    <section className="border border-border/70 bg-background" aria-label="Loading organizations">
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="space-y-4 p-5">
        {["one", "two"].map((item) => (
          <div key={item} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-1.5">
                <Skeleton className="size-7 rounded-full" />
                <Skeleton className="size-7 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
