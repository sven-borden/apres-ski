"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function CopyButton({
  text,
  label,
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const { t } = useLocale();

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "text-sm text-alpine hover:text-alpine/80 font-medium transition-colors",
        className,
      )}
    >
      {copied ? t.common.copied : (label ?? t.common.copy)}
    </button>
  );
}
