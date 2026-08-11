import { WorkspaceSidebarLayout } from "@/components/workspace-sidebar-layout";
import { requireAdmin } from "@/lib/require-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <WorkspaceSidebarLayout kind="admin">{children}</WorkspaceSidebarLayout>;
}
