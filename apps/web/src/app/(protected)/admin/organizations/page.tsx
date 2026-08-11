import { Building2 } from "lucide-react";

import { AdminResourcePage } from "@/components/admin-resource-page";

export default function AdminOrganizationsPage() {
  return <AdminResourcePage title="Organizations" description="Keep a clear view of every team workspace." icon={Building2} rows={[{ name: "Acme Labs", detail: "18 members / Pro", status: "Healthy" }, { name: "Northstar", detail: "7 members / Free", status: "Healthy" }, { name: "Studio Common", detail: "23 members / Enterprise", status: "Healthy" }]} />;
}
