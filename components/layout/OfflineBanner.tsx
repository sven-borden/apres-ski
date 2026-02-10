"use client";

import { useOnline } from "@/lib/hooks/useOnline";

export function OfflineBanner() {
  const online = useOnline();

  if (online) return null;

  return (
    <div className="bg-spritz/10 text-spritz text-sm text-center py-2 px-4 backdrop-blur-md border-b border-spritz/10">
      You&apos;re offline — changes will sync when you reconnect
    </div>
  );
}
