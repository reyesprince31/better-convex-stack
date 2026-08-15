import { Suspense } from "react";

import { AnnouncementBanner } from "@/components/announcements/announcement-banner";
import { PublicNav } from "@/components/navigation/public-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <Suspense fallback={null}>
        <AnnouncementBanner />
      </Suspense>
      <PublicNav />
      {children}
    </div>
  );
}
