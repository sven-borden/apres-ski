"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function RevealField({
  label,
  value,
  copyable = false,
  className,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const { t } = useLocale();

  if (!value) return null;

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-sm font-medium text-midnight">{label}</p>
      {revealed ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-midnight/80 font-mono">{value}</span>
          {copyable && <CopyButton text={value} />}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="text-sm text-alpine hover:text-alpine/80 font-medium transition-colors"
        >
          {t.common.tap_to_reveal}
        </button>
      )}
    </div>
  );
}
