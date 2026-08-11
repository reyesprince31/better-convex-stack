import { CreditCard } from "lucide-react";

import { AdminResourcePage } from "@/components/admin/admin-resource-page";
import { mockAdminResources } from "@/lib/mock-workspace";

export default function AdminSubscriptionsPage() {
  return <AdminResourcePage title="Subscriptions" description="Monitor plan health and billing momentum." icon={CreditCard} rows={mockAdminResources.subscriptions} />;
}
