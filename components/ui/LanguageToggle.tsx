"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
      aria-label={locale === "fr" ? t.common.switch_to_en : t.common.switch_to_fr}
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border border-glass-border bg-glass backdrop-blur-sm text-midnight hover:bg-white/60 transition-colors",
        className,
      )}
    >
      {locale === "fr" ? "EN" : "FR"}
    </button>
  );
}
