"use client";

import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesktopHeader />
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          {children}
        </div>
      </main>
      <MobileTabBar />
    </>
  );
}
