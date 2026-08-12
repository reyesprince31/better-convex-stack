import { redirect } from "next/navigation";
import type { Route } from "next";

export default function LegacySignUpPage() {
  redirect("/signup" as Route);
}
