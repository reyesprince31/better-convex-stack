import { OrganizationManagement } from "@/components/organization/organization-management";

export default function OrganizationsPage() {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:py-10 space-y-8">
        <section className="border-b border-border/70 pb-8">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              Personal workspace
            </p>
            <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em]">Organizations</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Create, rename, and remove the workspaces connected to your account.
            </p>
          </div>
        </section>
        <OrganizationManagement />
      </div>
    </main>
  );
}
