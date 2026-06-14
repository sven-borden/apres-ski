"use client";

import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { PageViewTracker } from "@/components/layout/PageViewTracker";
import { MountainBackdrop } from "@/components/layout/MountainBackdrop";
import { SnowOverlay } from "@/components/layout/SnowOverlay";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-sky-300/25 via-sky-200/10 to-transparent" />
      <MountainBackdrop />
      <PageViewTracker />
      <DesktopHeader />
      <OfflineBanner />
      <SnowOverlay />
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          {children}
        </div>
      </main>
      <MobileTabBar />
    </>
  );
}
