import type { Metadata } from "next";
import { Suspense } from "react";

import AuthFormSkeleton from "@/components/auth/auth-form-skeleton";
import AuthPage from "@/components/auth/auth-page";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthPage>
      <Suspense fallback={<AuthFormSkeleton fieldCount={1} />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthPage>
  );
}
