"use client";

import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@better-convex-stack/ui/components/avatar";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { useMutation, useQuery } from "convex/react";
import { BadgeCheck, CircleUserRound } from "lucide-react";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type * as React from "react";
import { toast } from "sonner";

import { SettingsTabs, type SettingsTab } from "@/components/shared/settings-ui";
import { authClient } from "@/lib/auth-client";

import {
  AccountAdvancedPanel,
  DangerSettingsPanel,
  DeleteAccountDialog,
  NotificationSettingsPanel,
  ProfileSettingsPanel,
  SecuritySettingsPanel,
} from "./account-settings-panels";
import {
  accountTabs,
  defaultNotificationSettings,
  DELETE_CONFIRMATION,
  getErrorMessage,
  getInitials,
  isAccountTab,
  NOTIFICATION_STORAGE_KEY,
  type AccountTab,
  type NotificationId,
  type NotificationSettings,
} from "./account-settings-data";

export function AccountSettingsFallback() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading account settings">
      <Skeleton className="h-32" />
      <Skeleton className="h-12 w-full" />
      <section className="border border-border/70 bg-card p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-72 max-w-full" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      </section>
    </div>
  );
}

function loadNotificationSettings(): NotificationSettings | null {
  try {
    const stored = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<NotificationSettings>;

    return Object.fromEntries(
      Object.entries(defaultNotificationSettings).map(([id, fallback]) => {
        const saved = parsed[id as NotificationId];
        return [
          id,
          {
            email:
              id === "security-alerts" || id === "billing-emails"
                ? true
                : typeof saved?.email === "boolean"
                  ? saved.email
                  : fallback.email,
            inApp: typeof saved?.inApp === "boolean" ? saved.inApp : fallback.inApp,
          },
        ];
      }),
    ) as NotificationSettings;
  } catch {
    return null;
  }
}

export default function AccountSettings() {
  const user = useQuery(api.auth.getCurrentUser);
  const deleteCurrentUser = useMutation(api.account.deleteCurrentUser);
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [notifications, setNotifications] = useState<NotificationSettings>(
    defaultNotificationSettings,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const requestedTab = searchParams.get("tab") ?? searchParams.get("section");
  const activeTab: AccountTab = isAccountTab(requestedTab) ? requestedTab : "profile";

  useEffect(() => {
    if (user) setName(user.name ?? "");
  }, [user?.name]);

  useEffect(() => {
    const stored = loadNotificationSettings();
    if (stored) setNotifications(stored);
  }, []);

  if (user === undefined) return <AccountSettingsFallback />;

  if (!user) {
    return (
      <p className="border border-destructive/30 bg-destructive/5 px-5 py-6 text-sm text-muted-foreground">
        We could not load your account details. Refresh the page and try again.
      </p>
    );
  }

  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Account";
  const initials = getInitials(displayName);
  const tabs: ReadonlyArray<SettingsTab<AccountTab>> = accountTabs.map((tab) => ({
    ...tab,
    href: (tab.id === "profile" ? "/home/settings" : `/home/settings?tab=${tab.id}`) as Route,
  }));

  async function saveProfile(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      toast.error("Enter a name before saving.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const result = await authClient.updateUser({ name: nextName });
      if (result.error) throw result.error;
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Your profile could not be updated."));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function updatePassword(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Your new password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (result.error) throw result.error;
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated and other sessions signed out");
    } catch (error) {
      toast.error(getErrorMessage(error, "Your password could not be updated."));
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  async function revokeOtherSessions() {
    setIsRevokingSessions(true);
    try {
      const result = await authClient.revokeOtherSessions();
      if (result.error) throw result.error;
      toast.success("Other sessions signed out");
    } catch (error) {
      toast.error(getErrorMessage(error, "Other sessions could not be signed out."));
    } finally {
      setIsRevokingSessions(false);
    }
  }

  function toggleNotification(id: NotificationId, channel: "email" | "inApp", checked: boolean) {
    setNotifications((current) => ({
      ...current,
      [id]: { ...current[id], [channel]: checked },
    }));
  }

  function saveNotifications() {
    window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
    toast.success("Notification preferences saved to this browser");
  }

  function showMockAction(label: string) {
    toast.info(`${label} is UI-ready. Connect storage and audit logging to enable it.`);
  }

  async function deleteAccount(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (deleteConfirm !== DELETE_CONFIRMATION) {
      toast.error(`Type "${DELETE_CONFIRMATION}" to confirm.`);
      return;
    }
    if (!deletePassword) {
      toast.error("Enter your current password to continue.");
      return;
    }

    setIsDeletingAccount(true);
    try {
      const result = await deleteCurrentUser({ password: deletePassword });
      if (!result.success) throw new Error("Your current password is incorrect.");
      toast.success("Your account has been deleted");
      window.location.replace("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "Your account could not be deleted."));
      setIsDeletingAccount(false);
    }
  }

  function setDeleteDialog(nextOpen: boolean) {
    setDeleteDialogOpen(nextOpen);
    if (!nextOpen) {
      setDeleteConfirm("");
      setDeletePassword("");
    }
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden bg-foreground px-5 py-6 text-background sm:px-7 sm:py-7">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-16 rounded-none ring-1 ring-background/25">
              <AvatarImage src={user.image ?? undefined} alt={displayName} />
              <AvatarFallback className="rounded-none bg-background/10 text-lg text-background">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-xl font-semibold tracking-[-0.035em]">
                  {displayName}
                </h2>
                {user.emailVerified ? <BadgeCheck className="size-4 shrink-0" /> : null}
              </div>
              <p className="mt-1 truncate text-sm text-background/75">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-background/15 bg-background/[0.07] px-4 py-3 sm:max-w-56">
            <CircleUserRound className="size-4 shrink-0" />
            <p className="text-xs/relaxed text-background/80">
              Personal settings apply across every workspace.
            </p>
          </div>
        </div>
      </section>

      <SettingsTabs tabs={tabs} activeTab={activeTab} label="Account settings" />

      {activeTab === "profile" ? (
        <ProfileSettingsPanel
          user={user}
          name={name}
          initials={initials}
          isSaving={isSavingProfile}
          onNameChange={setName}
          onSubmit={(event) => void saveProfile(event)}
        />
      ) : null}

      {activeTab === "security" ? (
        <SecuritySettingsPanel
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          isUpdatingPassword={isUpdatingPassword}
          isRevokingSessions={isRevokingSessions}
          onCurrentPasswordChange={setCurrentPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onUpdatePassword={(event) => void updatePassword(event)}
          onRevokeOtherSessions={() => void revokeOtherSessions()}
        />
      ) : null}

      {activeTab === "notifications" ? (
        <NotificationSettingsPanel
          notifications={notifications}
          onToggle={toggleNotification}
          onSave={saveNotifications}
        />
      ) : null}

      {activeTab === "advanced" ? <AccountAdvancedPanel onMockAction={showMockAction} /> : null}

      {activeTab === "danger" ? (
        <DangerSettingsPanel onDelete={() => setDeleteDialog(true)} />
      ) : null}

      <DeleteAccountDialog
        open={deleteDialogOpen}
        confirmation={deleteConfirm}
        password={deletePassword}
        isDeleting={isDeletingAccount}
        onOpenChange={setDeleteDialog}
        onConfirmationChange={setDeleteConfirm}
        onPasswordChange={setDeletePassword}
        onSubmit={(event) => void deleteAccount(event)}
      />
    </div>
  );
}
