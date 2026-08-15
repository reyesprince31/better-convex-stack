"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import { Input } from "@better-convex-stack/ui/components/input";
import { Label } from "@better-convex-stack/ui/components/label";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import AuthFormShell from "@/components/auth/auth-form-shell";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Missing password reset token. Please request a new link.");
        return;
      }

      const { error } = await authClient.resetPassword({
        newPassword: value.password,
        token,
      });

      if (error) {
        toast.error(error.message || error.statusText || "Failed to reset password");
        return;
      }

      toast.success("Password reset successfully. You can now log in.");
      router.replace("/login");
    },
    validators: {
      onSubmit: z
        .object({
          password: z.string().min(8, "Password must be at least 8 characters"),
          confirmPassword: z.string().min(8, "Please confirm your password"),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        }),
    },
  });

  if (!token || errorParam) {
    return (
      <AuthFormShell
        title="Invalid reset link"
        description="This password reset link is invalid or has expired."
        footer={
          <p className="text-center text-xs text-muted-foreground">
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Back to log in
            </Link>
          </p>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Password reset links expire after 1 hour or after being used. Please request a fresh reset link.
          </p>
          <Button
            render={<Link href="/forgot-password">Request new reset link</Link>}
            className="w-full"
          />
        </div>
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell
      title="Create new password"
      description="Choose a strong password with at least 8 characters."
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
        <form.Field name="password">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>New password</Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {field.state.meta.errors.map((error, index) => (
                <p
                  key={`${error?.message ?? "password-error"}-${index}`}
                  className="text-xs text-destructive"
                >
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Confirm new password</Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {field.state.meta.errors.map((error, index) => (
                <p
                  key={`${error?.message ?? "confirm-password-error"}-${index}`}
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
              {isSubmitting ? "Resetting password..." : "Set new password"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthFormShell>
  );
}
