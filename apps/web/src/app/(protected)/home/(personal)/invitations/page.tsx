import { OrganizationInvitationInbox } from "@/components/organization/organization-invitation-inbox";

export default function InvitationsPage() {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        <OrganizationInvitationInbox />
      </div>
    </main>
  );
}
