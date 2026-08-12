"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import SignInForm from "@/components/auth/sign-in-form";
import SignUpForm from "@/components/auth/sign-up-form";

export function AuthModeSwitcher({ initialMode }: { initialMode: "sign-in" | "sign-up" }) {
  const [mode, setMode] = useState(initialMode);
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get("redirect");
  const redirectTo =
    requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "/home";

  return mode === "sign-in" ? (
    <SignInForm onSwitchToSignUp={() => setMode("sign-up")} redirectTo={redirectTo} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setMode("sign-in")} redirectTo={redirectTo} />
  );
}
