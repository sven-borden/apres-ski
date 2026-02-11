"use client";

import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const statusClasses = {
  unassigned: "bg-mist/20 text-mist",
  claimed: "bg-alpine/10 text-alpine",
  confirmed: "bg-pine/10 text-pine",
} as const;

export function StatusBadge({
  status,
}: {
  status: "unassigned" | "claimed" | "confirmed";
}) {
  const { t } = useLocale();

  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-0.5 text-xs font-medium",
        statusClasses[status],
      )}
    >
      {t.status[status]}
    </span>
  );
}
