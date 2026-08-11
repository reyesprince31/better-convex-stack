import { use } from "react";

import { WorkspaceSidebarLayout } from "@/components/workspace-sidebar-layout";
import { requireAdmin } from "@/lib/require-auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  use(requireAdmin());
  return <WorkspaceSidebarLayout kind="admin">{children}</WorkspaceSidebarLayout>;
}
