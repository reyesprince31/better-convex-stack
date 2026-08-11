import { WorkspaceSidebarLayout } from "@/components/workspace-sidebar-layout";

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceSidebarLayout kind="organization">{children}</WorkspaceSidebarLayout>;
}
