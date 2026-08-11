import { Separator } from "@better-convex-stack/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@better-convex-stack/ui/components/sidebar";

import { AppSidebar } from "@/components/app-sidebar";

export function WorkspaceSidebarLayout({
  kind,
  orgSlug,
  children,
}: {
  kind: "admin" | "organization";
  orgSlug?: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-svh max-h-svh min-h-0 overflow-hidden">
      <AppSidebar kind={kind} orgSlug={orgSlug} />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-1 data-vertical:h-4 data-vertical:self-auto"
          />
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            {kind === "admin" ? "Control room" : "Organization workspace"}
          </p>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 px-5 py-8 sm:px-8 lg:py-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function ProtectedShellSkeleton() {
  return (
    <div className="h-svh max-h-svh min-h-0 overflow-hidden bg-muted/30 lg:grid lg:grid-cols-[16rem_1fr]">
      <div className="hidden border-r border-border/70 bg-background lg:block" />
      <div className="min-h-0 overflow-hidden p-5 sm:p-8">
        <div className="h-4 w-36 animate-pulse bg-muted" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="h-32 animate-pulse bg-muted" />
          <div className="h-32 animate-pulse bg-muted" />
          <div className="h-32 animate-pulse bg-muted" />
        </div>
      </div>
    </div>
  );
}
