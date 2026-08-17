import { Suspense } from "react";

import { AnnouncementBanner } from "@/components/announcements/announcement-banner";
import { PersonalHeader } from "@/components/workspace/personal-header";

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh max-h-svh min-h-0 flex-col overflow-hidden bg-background">
      <Suspense fallback={null}>
        <AnnouncementBanner />
      </Suspense>
      <PersonalHeader />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
