import { CreditCard } from "lucide-react";

import { AdminResourcePage } from "@/components/admin-resource-page";

export default function AdminSubscriptionsPage() {
  return <AdminResourcePage title="Subscriptions" description="Monitor plan health and billing momentum." icon={CreditCard} rows={[{ name: "Pro", detail: "32 active subscriptions", status: "Growing" }, { name: "Enterprise", detail: "6 active subscriptions", status: "Stable" }, { name: "Free", detail: "10 workspaces", status: "Healthy" }]} />;
}
