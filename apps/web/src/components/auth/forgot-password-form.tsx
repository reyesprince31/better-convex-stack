"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import { Input } from "@better-convex-stack/ui/components/input";
import { Label } from "@better-convex-stack/ui/components/label";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import AuthFormShell from "@/components/auth/auth-form-shell";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await authClient.requestPasswordReset({
        email: value.email,
        redirectTo,
      });

      if (error) {
        toast.error(error.message || error.statusText || "Failed to send reset email");
        return;
      }

      setSubmittedEmail(value.email);
      toast.success("Password reset email sent");
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Enter a valid email address"),
      }),
    },
  });

  if (submittedEmail) {
    return (
      <AuthFormShell
        title="Check your inbox"
        description={`If an account is associated with ${submittedEmail}, you will receive an email with instructions to reset your password.`}
        footer={
          <p className="text-center text-xs text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Back to log in
            </Link>
          </p>
        }
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Click the link inside the email to set a new password. If you don't see it, check your
            spam folder.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSubmittedEmail(null);
            }}
          >
            Try another email
          </Button>
        </div>
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell
      title="Reset your password"
      description="Enter the email associated with your account and we'll send you a reset link."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Back to log in
          </Link>
        </p>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-5"
      >
        <form.Field name="email">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Email</Label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {field.state.meta.errors.map((error, index) => (
                <p
                  key={`${error?.message ?? "email-error"}-${index}`}
                  className="text-xs text-destructive"
                >
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button type="submit" className="h-10 w-full" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Sending reset link..." : "Send reset link"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthFormShell>
  );
}
