import type { Route } from "next";
import { redirect } from "next/navigation";

export default function ChatRedirectPage() {
  redirect("/home" as Route);
}
