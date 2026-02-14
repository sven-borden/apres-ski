"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

const PAGE_NAMES: Record<string, string> = {
  "/": "Hub",
  "/feasts": "Feasts",
  "/crew": "Crew",
  "/basecamp": "Basecamp",
};

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const name = PAGE_NAMES[pathname] ?? pathname;
    trackPageView(name);
  }, [pathname]);

  return null;
}
