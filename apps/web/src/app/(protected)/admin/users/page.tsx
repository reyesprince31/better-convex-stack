import { Users } from "lucide-react";

import { AdminResourcePage } from "@/components/admin-resource-page";

export default function AdminUsersPage() {
  return <AdminResourcePage title="Users" description="Review members and their access across Orbit." icon={Users} rows={[{ name: "Maya Chen", detail: "maya@acme.test", status: "Active" }, { name: "Jon Bell", detail: "jon@northstar.test", status: "Active" }, { name: "Rina Patel", detail: "rina@orbit.test", status: "Invited" }]} />;
}
