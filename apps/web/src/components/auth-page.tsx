"use client";

import Link from "next/link";
import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export default function AuthPage({ initialMode }: { initialMode: "sign-in" | "sign-up" }) {
  const [mode, setMode] = useState(initialMode);

  return (
    <main className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-foreground p-10 text-background lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-28 -top-28 size-80 rounded-full border border-background/15" />
        <div className="absolute -bottom-44 -left-20 size-96 rounded-full border border-background/10" />
        <div>
          <Link href="/" className="font-mono text-xs tracking-[0.22em] uppercase opacity-70">
            Orbit / account
          </Link>
          <div className="mt-24 max-w-lg">
            <p className="font-mono text-[10px] tracking-[0.2em] text-background/55 uppercase">A quieter way to build</p>
            <h1 className="mt-5 text-5xl font-medium leading-[0.98] tracking-[-0.06em] xl:text-7xl">
              Keep the signal.
              <br />
              Lose the noise.
            </h1>
          </div>
        </div>
        <p className="max-w-sm text-sm leading-6 text-background/60">
          Orbit gives every team a clear place to think, plan, and ship together — without turning work into a second job.
        </p>
      </section>
      <section className="flex items-center justify-center bg-background px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="font-mono text-xs font-semibold tracking-[0.22em] uppercase">
              Orbit
            </Link>
          </div>
          {mode === "sign-in" ? (
            <SignInForm onSwitchToSignUp={() => setMode("sign-up")} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setMode("sign-in")} />
          )}
        </div>
      </section>
    </main>
  );
}
