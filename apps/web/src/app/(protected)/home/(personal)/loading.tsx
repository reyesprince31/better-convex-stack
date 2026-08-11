export default function PersonalHomeLoading() {
  return (
    <div className="space-y-10" aria-label="Loading personal workspace">
      <div className="space-y-3 border-b border-border/70 pb-8">
        <div className="h-3 w-40 animate-pulse bg-muted" />
        <div className="h-12 w-72 animate-pulse bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 animate-pulse bg-muted" />
        <div className="h-32 animate-pulse bg-muted" />
        <div className="h-32 animate-pulse bg-muted" />
      </div>
      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="h-72 animate-pulse bg-muted" />
        <div className="h-72 animate-pulse bg-muted" />
      </div>
    </div>
  );
}
