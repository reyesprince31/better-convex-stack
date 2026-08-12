"use client";

import { Button } from "@better-convex-stack/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@better-convex-stack/ui/components/dialog";
import { Input } from "@better-convex-stack/ui/components/input";
import { Label } from "@better-convex-stack/ui/components/label";
import { MailPlus } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import {
  getAuthErrorMessage,
  type OrganizationInvitationShare,
} from "@/components/organization/organization-member-types";

type OrganizationRole = "member" | "admin" | "owner";

export function OrganizationInviteForm({
  organizationId,
  canInvite,
  canInviteOwner,
  onInvitationCreated,
}: {
  organizationId: string;
  canInvite: boolean;
  canInviteOwner: boolean;
  onInvitationCreated: (invitation: OrganizationInvitationShare) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrganizationRole>("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const nextEmail = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const nextRole = String(formData.get("role") ?? "member");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = await authClient.organization.inviteMember({
        email: nextEmail,
        role: nextRole as OrganizationRole,
        organizationId,
      });

      if (result.error || !result.data) {
        throw new Error(getAuthErrorMessage(result.error, "The invitation could not be created."));
      }

      const url = new URL("/accept-invitation", window.location.origin);
      url.searchParams.set("id", result.data.id);

      setEmail("");
      setRole("member");
      setIsOpen(false);
      onInvitationCreated({
        email: nextEmail,
        invitationId: result.data.id,
        inviteLink: url.toString(),
        role: nextRole,
      });
      toast.success("Invitation created");
    } catch (error) {
      setFormError(getAuthErrorMessage(error, "The invitation could not be created."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="border border-border/70 bg-background"
      aria-labelledby="invite-member-title"
    >
      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex size-8 shrink-0 items-center justify-center bg-foreground text-background">
          <MailPlus className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            Members
          </p>
          <h2 id="invite-member-title" className="mt-1 text-sm font-medium">
            Invite a member
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Send an invitation with the right workspace role.
          </p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            if (open) {
              setEmail("");
              setRole("member");
              setFormError(null);
              setIsOpen(true);
            } else if (!isSubmitting) {
              setIsOpen(false);
            }
          }}
        >
          <DialogTrigger
            render={
              <Button type="button" className="w-full gap-2 sm:w-auto" disabled={!canInvite}>
                <MailPlus className="size-3.5" />
                Invite member
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a member</DialogTitle>
              <DialogDescription>
                They will receive the selected role after accepting the invitation.
              </DialogDescription>
            </DialogHeader>

            <form
              id="organization-invite-form"
              className="grid gap-4 px-5 pt-5 sm:px-6 sm:pt-6"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-2">
                <Label htmlFor="member-invite-email">Email address</Label>
                <Input
                  id="member-invite-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="teammate@example.com"
                  autoComplete="email"
                  disabled={!canInvite || isSubmitting}
                  autoFocus
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="member-invite-role">Role</Label>
                <select
                  id="member-invite-role"
                  name="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as OrganizationRole)}
                  className="h-9 border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!canInvite || isSubmitting}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  {canInviteOwner ? <option value="owner">Owner</option> : null}
                </select>
              </div>

              {formError ? (
                <p className="text-xs text-destructive" role="alert">
                  {formError}
                </p>
              ) : null}
            </form>
            <DialogFooter>
              <DialogClose
                render={
                  <Button type="button" variant="ghost" disabled={isSubmitting}>
                    Close
                  </Button>
                }
              />
              <Button
                type="submit"
                form="organization-invite-form"
                className="gap-2"
                disabled={!canInvite || isSubmitting}
              >
                <MailPlus className="size-3.5" />
                {isSubmitting ? "Inviting..." : "Invite member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {!canInvite ? (
        <p className="border-t border-border/70 px-5 py-3 text-xs text-muted-foreground">
          Only workspace admins and owners can invite members.
        </p>
      ) : null}
    </section>
  );
}
