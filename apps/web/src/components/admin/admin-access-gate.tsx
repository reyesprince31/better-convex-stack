import { requireAdmin } from "@/lib/require-auth";

export async function AdminAccessGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
