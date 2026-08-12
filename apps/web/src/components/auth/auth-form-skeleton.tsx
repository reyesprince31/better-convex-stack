import { Card, CardContent, CardHeader } from "@better-convex-stack/ui/components/card";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";

export default function AuthFormSkeleton({ fieldCount }: { fieldCount: number }) {
  return (
    <Card
      className="gap-0 border-border/70 py-0 shadow-none"
      aria-busy="true"
      aria-label="Loading authentication form"
    >
      <CardHeader className="gap-3 border-b border-border/70 px-5 py-6 sm:px-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </CardHeader>
      <CardContent className="space-y-5 px-5 py-6 sm:px-6">
        {Array.from({ length: fieldCount }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
