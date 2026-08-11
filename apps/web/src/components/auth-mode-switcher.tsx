"use client";

import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export function AuthModeSwitcher({ initialMode }: { initialMode: "sign-in" | "sign-up" }) {
  const [mode, setMode] = useState(initialMode);

  return mode === "sign-in" ? (
    <SignInForm onSwitchToSignUp={() => setMode("sign-up")} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setMode("sign-in")} />
  );
}
