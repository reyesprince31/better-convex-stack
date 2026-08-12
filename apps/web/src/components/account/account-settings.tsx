"use client";

import { api } from "@better-convex-stack/backend/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@better-convex-stack/ui/components/avatar";
import { Button } from "@better-convex-stack/ui/components/button";
import { Input } from "@better-convex-stack/ui/components/input";
import { Label } from "@better-convex-stack/ui/components/label";
import { Skeleton } from "@better-convex-stack/ui/components/skeleton";
import { useMutation, useQuery } from "convex/react";
import {
  Bell,
  ChevronRight,
  CircleUserRound,
  LoaderCircle,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { useEffect, useState } from "react";
import type * as React from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

const DELETE_CONFIRMATION = "delete my account";

const notificationPrefs = [
  {
    id: "product-updates",
    title: "Product updates",
    description: "New features, improvements, and announcements.",
    defaultChecked: true,
  },
  {
    id: "security-alerts",
    title: "Security alerts",
    description: "Sign-ins from new devices and password changes.",
    defaultChecked: true,
  },
  {
    id: "billing-emails",
    title: "Billing emails",
    description: "Invoices, receipts, and payment reminders.",
    defaultChecked: false,
  },
  {
    id: "marketing-emails",
    title: "Marketing emails",
    description: "Tips, offers, and product surveys.",
    defaultChecked: false,
  },
] as const;

type NotificationId = (typeof notificationPrefs)[number]["id"];

type AccountSection = "profile" | "security" | "notifications" | "danger";

const settingsSections = [
  {
    id: "profile",
    label: "Profile",
    description: "Your identity and contact details",
    icon: CircleUserRound,
  },
  {
    id: "security",
    label: "Security",
    description: "Password and account access",
    icon: ShieldCheck,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Updates and email preferences",
    icon: Bell,
  },
  {
    id: "danger",
    label: "Danger zone",
    description: "Delete your account",
    icon: TriangleAlert,
  },
] as const satisfies ReadonlyArray<{
  id: AccountSection;
  label: string;
  description: string;
  icon: typeof CircleUserRound;
}>;

const defaultNotifications = notificationPrefs.reduce(
  (preferences, preference) => {
    preferences[preference.id] = preference.defaultChecked;
    return preferences;
  },
  {} as Record<NotificationId, boolean>,
);

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string" && message) {
      return message;
    }
  }

  return fallback;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (
    (parts.length > 1 ? parts[0][0] + parts.at(-1)?.[0] : parts[0]?.slice(0, 2)) || "AC"
  ).toUpperCase();
}

export function AccountSettingsFallback() {
  return (
    <div
      className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]"
      aria-busy="true"
      aria-label="Loading account settings"
    >
      <div className="hidden space-y-2 lg:block">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <section className="border-y border-border/70 p-5 sm:p-6">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-5 w-48" />
        <Skeleton className="mt-2 h-3 w-72 max-w-full" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      </section>
    </div>
  );
}

function isAccountSection(value: string | null): value is AccountSection {
  return settingsSections.some((section) => section.id === value);
}

export default function AccountSettings() {
  const user = useQuery(api.auth.getCurrentUser);
  const deleteCurrentUser = useMutation(api.account.deleteCurrentUser);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [notifications, setNotifications] =
    useState<Record<NotificationId, boolean>>(defaultNotifications);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const requestedSection = searchParams.get("section");
  const activeSection: AccountSection = isAccountSection(requestedSection)
    ? requestedSection
    : "profile";

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
    }
  }, [user?.name]);

  if (user === undefined) {
    return <AccountSettingsFallback />;
  }

  if (!user) {
    return (
      <p className="border-y border-border/70 px-5 py-6 text-sm text-muted-foreground sm:px-6">
        We could not load your account details. Refresh the page and try again.
      </p>
    );
  }

  function selectSection(section: AccountSection) {
    const params = new URLSearchParams(searchParams.toString());

    if (section === "profile") {
      params.delete("section");
    } else {
      params.set("section", section);
    }

    const query = params.toString();
    router.replace((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false });
  }

  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Account";
  const initials = getInitials(displayName);
  const activeMeta = settingsSections.find((section) => section.id === activeSection)!;
  const ActiveIcon = activeMeta.icon;

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
      if (result.error) {
        throw result.error;
      }

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
      if (result.error) {
        throw result.error;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Your password could not be updated."));
    } finally {
      setIsUpdatingPassword(false);
    }
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
      if (!result.success) {
        throw new Error("Your current password is incorrect.");
      }
      toast.success("Your account has been deleted");
      window.location.replace("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "Your account could not be deleted."));
      setIsDeletingAccount(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Account
          </p>
          <nav className="mt-3 space-y-1" aria-label="Account settings sections">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => selectSection(section.id)}
                  className={`group flex w-full items-center gap-3 border-l-2 px-3 py-3 text-left transition-colors ${
                    isActive
                      ? "border-foreground bg-muted text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium">{section.label}</span>
                    <span className="mt-1 block truncate text-[10px] leading-tight text-muted-foreground">
                      {section.description}
                    </span>
                  </span>
                  <ChevronRight
                    className={`size-3 shrink-0 transition-transform ${isActive ? "translate-x-0.5 text-foreground" : "opacity-0 group-hover:opacity-100"}`}
                  />
                </button>
              );
            })}
          </nav>
          <div className="mt-8 border-t border-border/70 pt-4 text-[11px] leading-relaxed text-muted-foreground">
            Changes to your profile apply everywhere you use Orbit.
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <nav
          className="-mx-5 overflow-x-auto border-y border-border/70 lg:hidden"
          aria-label="Account settings sections"
        >
          <div className="flex min-w-max px-2">
            {settingsSections.map((section) => {
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => selectSection(section.id)}
                  className={`border-b-2 px-3 py-3 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="mb-6 flex items-start gap-3 border-b border-border/70 pb-5 pt-1">
          <div className="flex size-8 shrink-0 items-center justify-center border border-border/70 bg-muted/50">
            <ActiveIcon className="size-4" />
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              {activeMeta.label}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{activeMeta.description}</p>
          </div>
        </div>

        {activeSection === "profile" ? (
          <section className="border-y border-border/70">
            <div className="border-b border-border/70 px-5 py-5 sm:px-6">
              <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                Profile
              </p>
              <h2 className="mt-2 text-base font-medium">Profile and identity</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep your name current across personal and organization workspaces.
              </p>
            </div>
            <form onSubmit={saveProfile}>
              <div className="space-y-6 p-5 sm:p-6">
                <div className="flex items-center gap-4 border-b border-border/70 pb-6">
                  <Avatar className="size-14">
                    <AvatarImage src={user.image ?? undefined} alt={displayName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Profile photo editing will be available when workspace storage is connected.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="account-name">Full name</Label>
                    <Input
                      id="account-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-email">Email</Label>
                    <Input
                      id="account-email"
                      value={user.email}
                      readOnly
                      disabled
                      aria-describedby="account-email-help"
                    />
                    <p id="account-email-help" className="text-xs text-muted-foreground">
                      Email changes require verification and are not enabled for this workspace yet.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end border-t border-border/70 px-5 py-4 sm:px-6">
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? <LoaderCircle className="animate-spin" /> : null}
                  {isSavingProfile ? "Saving" : "Save changes"}
                </Button>
              </div>
            </form>
          </section>
        ) : null}

        {activeSection === "security" ? (
          <section className="border-y border-border/70">
            <div className="border-b border-border/70 px-5 py-5 sm:px-6">
              <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                Security
              </p>
              <h2 className="mt-2 text-base font-medium">Password and access</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your password and sign out other active sessions.
              </p>
            </div>
            <form onSubmit={updatePassword}>
              <div className="space-y-4 p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
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
                      onChange={(event) => setNewPassword(event.target.value)}
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
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-start gap-3 border-t border-border/70 pt-4">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Two-factor authentication</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Two-factor authentication is not configured for this workspace yet.
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground uppercase">
                    Soon
                  </span>
                </div>
              </div>
              <div className="flex justify-end border-t border-border/70 px-5 py-4 sm:px-6">
                <Button type="submit" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? <LoaderCircle className="animate-spin" /> : null}
                  {isUpdatingPassword ? "Updating" : "Update password"}
                </Button>
              </div>
            </form>
          </section>
        ) : null}

        {activeSection === "notifications" ? (
          <section className="border-y border-border/70">
            <div className="border-b border-border/70 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-muted-foreground" />
                <div>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                    Preferences
                  </p>
                  <h2 className="mt-2 text-base font-medium">Notifications</h2>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose what you want to be notified about. These choices apply to this browser for
                now.
              </p>
            </div>
            <div className="divide-y divide-border/70">
              {notificationPrefs.map((preference) => (
                <label
                  key={preference.id}
                  htmlFor={preference.id}
                  className="flex cursor-pointer items-start gap-4 px-5 py-4 sm:px-6"
                >
                  <input
                    id={preference.id}
                    type="checkbox"
                    checked={notifications[preference.id]}
                    onChange={(event) =>
                      setNotifications((current) => ({
                        ...current,
                        [preference.id]: event.target.checked,
                      }))
                    }
                    className="mt-0.5 size-4 accent-foreground"
                  />
                  <span>
                    <span className="block text-sm font-medium">{preference.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {preference.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === "danger" ? (
          <section className="border-y border-destructive/40">
            <div className="border-b border-destructive/40 px-5 py-5 sm:px-6">
              <p className="font-mono text-[10px] tracking-[0.18em] text-destructive uppercase">
                Danger zone
              </p>
              <h2 className="mt-2 text-base font-medium">Delete account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This permanently removes your account. Transfer any organization ownership first.
              </p>
            </div>
            <form onSubmit={deleteAccount}>
              <div className="space-y-4 p-5 sm:p-6">
                <div className="space-y-2">
                  <Label htmlFor="delete-confirm">
                    Type <span className="font-medium text-foreground">{DELETE_CONFIRMATION}</span>{" "}
                    to confirm
                  </Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirm}
                    onChange={(event) => setDeleteConfirm(event.target.value)}
                    placeholder={DELETE_CONFIRMATION}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delete-password">Current password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end border-t border-destructive/40 px-5 py-4 sm:px-6">
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={
                    isDeletingAccount ||
                    deleteConfirm !== DELETE_CONFIRMATION ||
                    deletePassword.length === 0
                  }
                >
                  {isDeletingAccount ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
                  {isDeletingAccount ? "Deleting" : "Delete account"}
                </Button>
              </div>
            </form>
          </section>
        ) : null}
      </div>
    </div>
  );
}
