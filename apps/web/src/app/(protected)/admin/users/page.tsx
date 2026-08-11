import { Users } from "lucide-react";

import { AdminResourcePage } from "@/components/admin/admin-resource-page";
import { mockAdminResources } from "@/lib/mock-workspace";

export default function AdminUsersPage() {
  return <AdminResourcePage title="Users" description="Review members and their access across Orbit." icon={Users} rows={mockAdminResources.users} />;
}
