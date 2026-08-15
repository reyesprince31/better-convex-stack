import { Suspense } from "react";

import AccountSettings, { AccountSettingsFallback } from "@/components/account/account-settings";

export default function PersonalSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="w-full space-y-7">
        <div className="pb-1">
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Your account
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Account settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm/relaxed text-muted-foreground">
            Manage your identity, AI provider keys (BYOK), security, and notifications.
          </p>
        </div>
        <Suspense fallback={<AccountSettingsFallback />}>
          <AccountSettings />
        </Suspense>
      </div>
    </div>
  );
}
