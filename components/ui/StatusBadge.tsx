"use client";

import { cn } from "@/lib/utils/cn";

const statusConfig = {
  unassigned: { label: "Unassigned", classes: "bg-mist/20 text-mist" },
  claimed: { label: "Claimed", classes: "bg-alpine/10 text-alpine" },
  confirmed: { label: "Confirmed", classes: "bg-pine/10 text-pine" },
} as const;

export function StatusBadge({
  status,
}: {
  status: "unassigned" | "claimed" | "confirmed";
}) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-0.5 text-xs font-medium",
        config.classes,
      )}
    >
      {config.label}
    </span>
  );
}
