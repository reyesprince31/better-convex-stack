import { Building2 } from "lucide-react";

import { AdminResourcePage } from "@/components/admin-resource-page";
import { mockAdminResources } from "@/lib/mock-workspace";

export default function AdminOrganizationsPage() {
  return <AdminResourcePage title="Organizations" description="Keep a clear view of every team workspace." icon={Building2} rows={mockAdminResources.organizations} />;
}
