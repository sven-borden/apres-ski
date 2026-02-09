"use client";

import { cn } from "@/lib/utils/cn";

export function DietaryTag({
  label,
  removable,
  onRemove,
}: {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-spritz/10 text-spritz",
      )}
    >
      {label}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:text-spritz/70"
          aria-label={`Remove ${label}`}
        >
          &times;
        </button>
      )}
    </span>
  );
}
