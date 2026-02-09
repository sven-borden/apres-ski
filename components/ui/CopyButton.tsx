"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

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
      {copied ? "Copied!" : label}
    </button>
  );
}
