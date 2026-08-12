import { Suspense } from "react";

import AccountSettings, { AccountSettingsFallback } from "@/components/account/account-settings";

export default function PersonalSettingsPage() {
  return (
    <div className="w-full space-y-8">
      <div className="border-b border-border/70 pb-8">
        <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
          Personal workspace
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em]">Settings</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A quiet place for the details that make Orbit yours.
        </p>
      </div>
      <Suspense fallback={<AccountSettingsFallback />}>
        <AccountSettings />
      </Suspense>
    </div>
  );
}
