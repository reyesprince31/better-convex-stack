import { WorkspaceSidebarLayout } from "@/components/workspace-sidebar-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceSidebarLayout kind="admin">{children}</WorkspaceSidebarLayout>;
}
