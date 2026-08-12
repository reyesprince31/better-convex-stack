"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import { Input } from "@better-convex-stack/ui/components/input";
import { Label } from "@better-convex-stack/ui/components/label";
import { useForm } from "@tanstack/react-form";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import AuthFormShell from "@/components/auth/auth-form-shell";
import { getAuthRouteHref, getSafeRedirect } from "@/components/auth/auth-redirect";
import { authClient } from "@/lib/auth-client";

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            toast.success("Check your email to verify your account");
            router.replace(getAuthRouteHref("/login", redirectTo) as Route);
          },
          onError: (error) => {
            toast.error(
              error.error.message || error.error.statusText || "Unable to create account",
            );
          },
        },
      );
    },
    validators: {
      onSubmit: z
        .object({
          name: z.string().min(2, "Name must be at least 2 characters"),
          email: z.email("Enter a valid email address"),
          password: z.string().min(8, "Password must be at least 8 characters"),
          confirmPassword: z.string().min(1, "Confirm your password"),
        })
        .refine((value) => value.password === value.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        }),
    },
  });

  return (
    <AuthFormShell
      title="Create your account"
      description="Start with a clear place for your team to work."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={getAuthRouteHref("/login", redirectTo)}
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Log in
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
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Name</Label>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="name"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
              />
              {field.state.meta.errors.map((error, index) => (
                <p
                  key={`${error?.message ?? "name-error"}-${index}`}
                  className="text-xs text-destructive"
                >
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

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

        <form.Field name="password">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Password</Label>
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
              <Label htmlFor={field.name}>Confirm password</Label>
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
              <p className="text-xs text-muted-foreground">
                Use the same password to confirm your account.
              </p>
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
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthFormShell>
  );
}
