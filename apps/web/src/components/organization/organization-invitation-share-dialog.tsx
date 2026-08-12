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
} from "@better-convex-stack/ui/components/dialog";
import { Input } from "@better-convex-stack/ui/components/input";
import { Label } from "@better-convex-stack/ui/components/label";
import { Check, Copy, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  formatOrganizationRole,
  type OrganizationInvitationShare,
} from "@/components/organization/organization-member-types";

export function OrganizationInvitationShareDialog({
  invitation,
  onClose,
}: {
  invitation: OrganizationInvitationShare | null;
  onClose: () => void;
}) {
  const [hasCopied, setHasCopied] = useState(false);

  async function copyInviteLink() {
    if (!invitation) return;

    try {
      await navigator.clipboard.writeText(invitation.inviteLink);
      setHasCopied(true);
      toast.success("Invitation link copied");
    } catch {
      toast.error("The link could not be copied. Select it and copy it manually.");
    }
  }

  function handleOpenChange(open: boolean) {
    if (open) return;

    setHasCopied(false);
    onClose();
  }

  return (
    <Dialog open={Boolean(invitation)} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitation created</DialogTitle>
          <DialogDescription>
            {invitation
              ? `${invitation.email} can join with the invitation link below.`
              : "The invitation link is ready to share."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="border border-border/70 bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center bg-foreground text-background">
                <Link2 className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">Share the invitation link</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {invitation
                    ? `${formatOrganizationRole(invitation.role)} access will be granted after they accept.`
                    : "Send this link to the invited person."}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <Label htmlFor="member-invite-link">Invitation link</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="member-invite-link"
                  value={invitation?.inviteLink ?? ""}
                  readOnly
                  aria-label="Invitation link"
                  className="min-w-0 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 sm:shrink-0"
                  disabled={!invitation}
                  onClick={() => void copyInviteLink()}
                >
                  {hasCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {hasCopied ? "Copied" : "Copy link"}
                </Button>
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              This link is valid for 7 days. The invitation is also emailed when email delivery is
              configured.
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="ghost">
                Done
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
