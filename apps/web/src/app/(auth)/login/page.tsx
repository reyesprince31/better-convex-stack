import type { Metadata } from "next";
import { Suspense } from "react";

import AuthFormSkeleton from "@/components/auth/auth-form-skeleton";
import AuthPage from "@/components/auth/auth-page";
import SignInForm from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthPage>
      <Suspense fallback={<AuthFormSkeleton fieldCount={2} />}>
        <SignInForm />
      </Suspense>
    </AuthPage>
  );
}
