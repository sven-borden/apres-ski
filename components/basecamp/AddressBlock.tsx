"use client";

import { CopyButton } from "@/components/ui/CopyButton";

export function AddressBlock({ address }: { address?: string }) {
  if (!address) return null;

  return (
    <div className="flex items-start justify-between gap-2">
      <p className="text-midnight/80 text-sm whitespace-pre-line">{address}</p>
      <CopyButton text={address} className="shrink-0" />
    </div>
  );
}
