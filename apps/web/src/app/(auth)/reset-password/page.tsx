import type { Metadata } from "next";
import { Suspense } from "react";

import AuthFormSkeleton from "@/components/auth/auth-form-skeleton";
import AuthPage from "@/components/auth/auth-page";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <AuthPage>
      <Suspense fallback={<AuthFormSkeleton fieldCount={2} />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPage>
  );
}
