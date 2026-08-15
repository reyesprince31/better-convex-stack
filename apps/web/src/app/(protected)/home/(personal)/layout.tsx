import { Suspense } from "react";

import { AnnouncementBanner } from "@/components/announcements/announcement-banner";
import { PersonalHeader } from "@/components/workspace/personal-header";

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Suspense fallback={null}>
        <AnnouncementBanner />
      </Suspense>
      <PersonalHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
