import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { redirect } from "next/navigation";

import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";

export async function requireAuth() {
  if (!(await isAuthenticated())) {
    redirect("/sign-in");
  }
}

export async function requireAdmin() {
  await requireAuth();
  const user = await fetchAuthQuery(api.auth.getCurrentUser);

  if (user?.role !== "admin") {
    redirect("/home");
  }

  return user;
}
