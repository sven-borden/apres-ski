"use client";

import { useOnline } from "@/lib/hooks/useOnline";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function OfflineBanner() {
  const online = useOnline();
  const { t } = useLocale();

  if (online) return null;

  return (
    <div className="bg-spritz/10 text-spritz text-sm text-center py-2 px-4 backdrop-blur-md border-b border-spritz/10">
      {t.offline.banner}
    </div>
  );
}
