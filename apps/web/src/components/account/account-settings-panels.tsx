"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@better-convex-stack/ui/components/avatar";
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
import {
  ArchiveRestore,
  Check,
  Download,
  FileArchive,
  KeyRound,
  LoaderCircle,
  LogOut,
  Monitor,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type * as React from "react";

import { SettingsPanel, SettingsToggle } from "@/components/shared/settings-ui";

import {
  DELETE_CONFIRMATION,
  notificationPreferences,
  type NotificationId,
  type NotificationSettings,
} from "./account-settings-data";

type AccountUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
};

export function ProfileSettingsPanel({
  user,
  name,
  initials,
  isSaving,
  onNameChange,
  onSubmit,
}: {
  user: AccountUser;
  name: string;
  initials: string;
  isSaving: boolean;
  onNameChange: (value: string) => void;
  onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit}>
      <SettingsPanel
        title="Profile details"
        description="Your name and photo are shared across every workspace you join."
        footer={
          <Button type="submit" className="h-9 rounded-lg px-4" disabled={isSaving}>
            {isSaving ? <LoaderCircle className="animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        }
      >
        <div className="grid gap-7 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <div>
            <p className="text-xs font-medium">Profile photo</p>
            <div className="mt-3 flex items-center gap-3 lg:block">
              <Avatar className="size-16 rounded-none lg:size-20">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="rounded-none text-base">{initials}</AvatarFallback>
              </Avatar>
              <p className="max-w-48 text-[11px]/relaxed text-muted-foreground lg:mt-3">
                Photo updates are ready for a storage provider when your project needs them.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="account-name">Full name</Label>
              <Input
                id="account-name"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                className="h-10 rounded-lg"
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="account-email">Email address</Label>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  {user.emailVerified ? <Check className="size-3" /> : null}
                  {user.emailVerified ? "Verified" : "Verification pending"}
                </span>
              </div>
              <Input
                id="account-email"
                value={user.email}
                className="h-10 rounded-lg"
                readOnly
                disabled
                aria-describedby="account-email-help"
              />
              <p id="account-email-help" className="text-[11px]/relaxed text-muted-foreground">
                Email changes stay disabled until the verified change-email flow is connected.
              </p>
            </div>
          </div>
        </div>
      </SettingsPanel>
    </form>
  );
}

export function SecuritySettingsPanel({
  currentPassword,
  newPassword,
  confirmPassword,
  isUpdatingPassword,
  isRevokingSessions,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onUpdatePassword,
  onRevokeOtherSessions,
}: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isUpdatingPassword: boolean;
  isRevokingSessions: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onUpdatePassword: (event: React.SubmitEvent<HTMLFormElement>) => void;
  onRevokeOtherSessions: () => void;
}) {
  return (
    <div className="space-y-5">
      <form onSubmit={onUpdatePassword}>
        <SettingsPanel
          title="Password"
          description="Use at least eight characters. Saving also signs out your other sessions."
          footer={
            <Button type="submit" className="h-9 rounded-lg px-4" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? <LoaderCircle className="animate-spin" /> : <KeyRound />}
              {isUpdatingPassword ? "Updating..." : "Update password"}
            </Button>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => onCurrentPasswordChange(event.target.value)}
                className="h-10 rounded-lg"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => onNewPasswordChange(event.target.value)}
                className="h-10 rounded-lg"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => onConfirmPasswordChange(event.target.value)}
                className="h-10 rounded-lg"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
          </div>
        </SettingsPanel>
      </form>

      <SettingsPanel
        title="Active sessions"
        description="Keep this browser signed in and close every other active session."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center bg-muted">
              <Monitor className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">This browser</p>
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  Current
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Session details are verified by Better Auth.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg"
            disabled={isRevokingSessions}
            onClick={onRevokeOtherSessions}
          >
            {isRevokingSessions ? <LoaderCircle className="animate-spin" /> : <LogOut />}
            {isRevokingSessions ? "Signing out..." : "Sign out other sessions"}
          </Button>
        </div>
      </SettingsPanel>

      <SettingsPanel
        title="Two-factor authentication"
        description="Add an authenticator or passkey when your project enables the matching Better Auth plugin."
      >
        <div className="flex items-start gap-3 bg-muted/60 p-4">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Not configured</p>
            <p className="mt-1 text-xs/relaxed text-muted-foreground">
              The surface is ready, but no enrollment action is shown until a real method exists.
            </p>
          </div>
        </div>
      </SettingsPanel>
    </div>
  );
}

export function NotificationSettingsPanel({
  notifications,
  onToggle,
  onSave,
}: {
  notifications: NotificationSettings;
  onToggle: (id: NotificationId, channel: "email" | "inApp", checked: boolean) => void;
  onSave: () => void;
}) {
  return (
    <SettingsPanel
      title="Notification preferences"
      description="Choose how product, security, billing, and digest updates reach you."
      footer={
        <>
          <p className="mr-auto text-[11px]/relaxed text-muted-foreground">
            Security and billing email cannot be disabled.
          </p>
          <Button type="button" className="h-9 rounded-lg px-4" onClick={onSave}>
            Save preferences
          </Button>
        </>
      }
    >
      <div className="overflow-hidden border border-border/70">
        <div className="hidden grid-cols-[minmax(0,1fr)_5rem_5rem] border-b border-border/70 bg-muted/45 px-4 py-2.5 text-[11px] font-medium text-muted-foreground sm:grid">
          <span>Event</span>
          <span className="text-center">Email</span>
          <span className="text-center">In app</span>
        </div>
        <div className="divide-y divide-border/70">
          {notificationPreferences.map((preference) => {
            const value = notifications[preference.id];
            return (
              <div
                key={preference.id}
                className="grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_5rem_5rem] sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{preference.title}</p>
                    {preference.emailRequired ? (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Email required
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs/relaxed text-muted-foreground">
                    {preference.description}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-center">
                  <span className="text-xs text-muted-foreground sm:hidden">Email</span>
                  <SettingsToggle
                    id={`${preference.id}-email`}
                    checked={value.email}
                    disabled={preference.emailRequired}
                    label={`${preference.title} by email`}
                    onChange={(checked) => onToggle(preference.id, "email", checked)}
                  />
                </div>
                <div className="flex items-center justify-between sm:justify-center">
                  <span className="text-xs text-muted-foreground sm:hidden">In app</span>
                  <SettingsToggle
                    id={`${preference.id}-in-app`}
                    checked={value.inApp}
                    label={`${preference.title} in the app`}
                    onChange={(checked) => onToggle(preference.id, "inApp", checked)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SettingsPanel>
  );
}

export function DangerSettingsPanel({ onDelete }: { onDelete: () => void }) {
  return (
    <SettingsPanel
      title="Delete account"
      description="Permanently remove your identity after transferring any organization ownership."
      tone="danger"
      footer={
        <Button type="button" variant="destructive" className="h-9 rounded-lg" onClick={onDelete}>
          <Trash2 />
          Delete account
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-destructive/5 p-4">
          <p className="text-sm font-medium">What is removed</p>
          <p className="mt-1 text-xs/relaxed text-muted-foreground">
            Your account, sessions, connected identities, and membership records.
          </p>
        </div>
        <div className="bg-muted/55 p-4">
          <p className="text-sm font-medium">Before you continue</p>
          <p className="mt-1 text-xs/relaxed text-muted-foreground">
            Transfer owned workspaces and export anything you need to keep.
          </p>
        </div>
      </div>
    </SettingsPanel>
  );
}

export function AccountAdvancedPanel({ onMockAction }: { onMockAction: (label: string) => void }) {
  return (
    <SettingsPanel
      title="Data portability"
      description="Keep account export and import visible before a project needs a full migration system."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-border/70 p-4">
          <FileArchive className="size-4 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Export account data</p>
          <p className="mt-1 text-xs/relaxed text-muted-foreground">
            Prepare your profile, preferences, memberships, and activity as a portable archive.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 h-9 rounded-lg"
            onClick={() => onMockAction("Account export")}
          >
            <Download />
            Request export
          </Button>
        </div>
        <div className="border border-border/70 p-4">
          <ArchiveRestore className="size-4 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Import account data</p>
          <p className="mt-1 text-xs/relaxed text-muted-foreground">
            Add a validated dry-run import once the project has a stable account data contract.
          </p>
          <Button type="button" variant="outline" className="mt-4 h-9 rounded-lg" disabled>
            Import unavailable
          </Button>
        </div>
      </div>
      <p className="mt-4 text-[11px]/relaxed text-muted-foreground">
        This starter does not expose a download until the application defines which project data
        belongs to an account.
      </p>
    </SettingsPanel>
  );
}

export function DeleteAccountDialog({
  open,
  confirmation,
  password,
  isDeleting,
  onOpenChange,
  onConfirmationChange,
  onPasswordChange,
  onSubmit,
}: {
  open: boolean;
  confirmation: string;
  password: string;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmationChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isDeleting && onOpenChange(nextOpen)}>
      <DialogContent className="rounded-none">
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This cannot be undone. Your current password is required for verification.
          </DialogDescription>
        </DialogHeader>
        <form
          id="delete-account-form"
          className="grid gap-4 px-5 pt-5 sm:px-6 sm:pt-6"
          onSubmit={onSubmit}
        >
          <div className="grid gap-2">
            <Label htmlFor="delete-confirm">
              Type <span className="font-semibold text-foreground">{DELETE_CONFIRMATION}</span>
            </Label>
            <Input
              id="delete-confirm"
              value={confirmation}
              onChange={(event) => onConfirmationChange(event.target.value)}
              className="h-10 rounded-lg"
              placeholder={DELETE_CONFIRMATION}
              autoComplete="off"
              disabled={isDeleting}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="delete-password">Current password</Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              className="h-10 rounded-lg"
              autoComplete="current-password"
              disabled={isDeleting}
              required
            />
          </div>
        </form>
        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="ghost" className="rounded-lg" disabled={isDeleting}>
                Keep account
              </Button>
            }
          />
          <Button
            type="submit"
            form="delete-account-form"
            variant="destructive"
            className="rounded-lg"
            disabled={isDeleting || confirmation !== DELETE_CONFIRMATION || password.length === 0}
          >
            {isDeleting ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
            {isDeleting ? "Deleting..." : "Delete account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
