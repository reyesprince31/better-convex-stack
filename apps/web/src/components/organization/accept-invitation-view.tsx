"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { ArrowRight, Building2, Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type * as React from "react";

import { authClient } from "@/lib/auth-client";

import {
  formatOrganizationRole,
  getAuthErrorMessage,
} from "@/components/organization/organization-member-types";

type InvitationDetails = NonNullable<
  Awaited<ReturnType<typeof authClient.organization.getInvitation>>["data"]
>;

export function AcceptInvitationView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionQuery = authClient.useSession();
  const invitationId = searchParams.get("id");
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invitationId || sessionQuery.isPending) return;

    if (!sessionQuery.data) {
      setInvitation(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isCurrent = true;
    setIsLoading(true);
    setError(null);
    setInvitation(null);

    void authClient.organization
      .getInvitation({ query: { id: invitationId } })
      .then((result) => {
        if (!isCurrent) return;

        if (result.error || !result.data) {
          setError(getAuthErrorMessage(result.error, "This invitation is no longer available."));
          return;
        }

        setInvitation(result.data);
      })
      .catch((requestError: unknown) => {
        if (isCurrent)
          setError(getAuthErrorMessage(requestError, "This invitation is no longer available."));
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [invitationId, sessionQuery.data, sessionQuery.isPending]);

  async function acceptInvitation() {
    if (!invitationId || !invitation) return;

    setIsAccepting(true);
    setError(null);

    try {
      const result = await authClient.organization.acceptInvitation({ invitationId });

      if (result.error) {
        throw new Error(getAuthErrorMessage(result.error, "The invitation could not be accepted."));
      }

      toast.success(`You joined ${invitation.organizationName}`);
      router.push(`/home/${invitation.organizationSlug}`);
    } catch (acceptError) {
      setError(getAuthErrorMessage(acceptError, "The invitation could not be accepted."));
    } finally {
      setIsAccepting(false);
    }
  }

  if (!invitationId) {
    return (
      <InvitationState
        title="Invitation link is incomplete"
        description="Ask the inviter to send a new invitation link."
      />
    );
  }

  if (sessionQuery.isPending || isLoading) {
    return <InvitationLoading />;
  }

  if (!sessionQuery.data) {
    const redirectPath = `/accept-invitation?id=${encodeURIComponent(invitationId)}`;

    return (
      <InvitationState
        title="Sign in to accept this invitation"
        description="Use the account that received the invitation, then return here to join the workspace."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            render={<Link href={`/login?redirect=${encodeURIComponent(redirectPath)}` as Route} />}
            nativeButton={false}
          >
            Sign in <ArrowRight className="size-3.5" />
          </Button>
          <Button
            render={<Link href={`/signup?redirect=${encodeURIComponent(redirectPath)}` as Route} />}
            nativeButton={false}
            variant="outline"
          >
            Create account
          </Button>
        </div>
      </InvitationState>
    );
  }

  if (error || !invitation) {
    return (
      <InvitationState
        title="Invitation unavailable"
        description={error ?? "This invitation could not be found."}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-2xl items-center justify-center px-5 py-16 sm:px-8">
      <section
        className="w-full border border-border/70 bg-background"
        aria-labelledby="accept-invitation-title"
      >
        <div className="border-b border-border/70 px-6 py-6 sm:px-8">
          <div className="flex size-10 items-center justify-center bg-foreground text-background">
            <Building2 className="size-5" />
          </div>
          <p className="mt-6 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            Workspace invitation
          </p>
          <h1
            id="accept-invitation-title"
            className="mt-2 text-3xl font-medium tracking-tighter sm:text-4xl"
          >
            Join {invitation.organizationName}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            {invitation.inviterEmail} invited you to collaborate in this workspace.
          </p>
        </div>

        <div className="grid gap-3 px-6 py-6 sm:grid-cols-2 sm:px-8">
          <div className="border border-border/70 p-4">
            <ShieldCheck className="size-4 text-muted-foreground" />
            <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Your role
            </p>
            <p className="mt-1 text-sm font-medium">{formatOrganizationRole(invitation.role)}</p>
          </div>
          <div className="border border-border/70 p-4">
            <Check className="size-4 text-muted-foreground" />
            <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Signed in as
            </p>
            <p className="mt-1 truncate text-sm font-medium">{sessionQuery.data.user.email}</p>
          </div>
        </div>

        {error ? (
          <p className="px-6 text-xs text-destructive sm:px-8" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-border/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs text-muted-foreground">
            Accepting will add this workspace to your account.
          </p>
          <Button
            type="button"
            className="gap-2"
            disabled={isAccepting}
            onClick={() => void acceptInvitation()}
          >
            {isAccepting ? "Joining..." : "Accept invitation"}
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </section>
    </main>
  );
}

function InvitationLoading() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-2xl items-center justify-center px-5 py-16 sm:px-8">
      <section
        className="w-full border border-border/70 bg-background p-6 sm:p-8"
        aria-label="Loading invitation"
      >
        <Skeleton className="size-10" />
        <Skeleton className="mt-7 h-3 w-40" />
        <Skeleton className="mt-3 h-10 w-72 max-w-full" />
        <Skeleton className="mt-4 h-4 w-full max-w-lg" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </section>
    </main>
  );
}

function InvitationState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-2xl items-center justify-center px-5 py-16 sm:px-8">
      <section
        className="w-full border border-border/70 bg-background p-6 text-center sm:p-8"
        role="alert"
      >
        <Building2 className="mx-auto size-6 text-muted-foreground" />
        <h1 className="mt-5 text-2xl font-medium tracking-[-0.04em]">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {children ? <div className="mt-6">{children}</div> : null}
      </section>
    </main>
  );
}
