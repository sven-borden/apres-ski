"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  const { t } = useLocale();

  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-xs font-bold text-mist uppercase tracking-wider">
        {title}
      </h3>
      {href && (
        <Link
          href={href}
          className="text-xs font-medium text-alpine hover:text-alpine/80 transition-colors"
        >
          {linkLabel ?? t.common.view_all} &rarr;
        </Link>
      )}
    </div>
  );
}
