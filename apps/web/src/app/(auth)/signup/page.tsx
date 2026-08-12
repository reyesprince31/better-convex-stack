import type { Metadata } from "next";
import { Suspense } from "react";

import AuthFormSkeleton from "@/components/auth/auth-form-skeleton";
import AuthPage from "@/components/auth/auth-page";
import SignUpForm from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <AuthPage>
      <Suspense fallback={<AuthFormSkeleton fieldCount={4} />}>
        <SignUpForm />
      </Suspense>
    </AuthPage>
  );
}
