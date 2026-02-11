"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import type { Translations } from "@/lib/i18n/locales";

const navKeys: { key: keyof Translations["nav"]; href: string }[] = [
  { key: "hub", href: "/" },
  { key: "lineup", href: "/lineup" },
  { key: "feasts", href: "/feasts" },
  { key: "crew", href: "/crew" },
  { key: "basecamp", href: "/basecamp" },
];

export function DesktopHeader() {
  const pathname = usePathname();
  const { t } = useLocale();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-glass backdrop-blur-md border-b border-glass-border">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-midnight">
          <Image src="/logo.png" alt="" width={32} height={32} className="rounded-md" />
          Apres-Ski
        </Link>
        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1">
            {navKeys.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-alpine/10 text-alpine"
                    : "text-mist hover:text-midnight",
                )}
              >
                {t.nav[link.key]}
              </Link>
            ))}
          </nav>
          <LanguageToggle className="ml-2" />
        </div>
      </div>
    </header>
  );
}
