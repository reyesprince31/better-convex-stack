import { redirect } from "next/navigation";
import type { Route } from "next";

export default function LegacySignInPage() {
  redirect("/login" as Route);
}
