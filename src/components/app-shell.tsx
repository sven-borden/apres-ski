"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Desktop / tablet: top navigation */}
      <header className="sticky top-0 z-[var(--z-nav)] hidden border-b border-border/70 bg-bg/80 backdrop-blur-md md:block">
        <nav className="mx-auto flex h-16 w-full max-w-5xl items-center gap-2 px-6">
          <Link href="/" className="mr-4 flex items-center gap-2.5">
            <Image src="/logo.png" alt="" width={32} height={32} className="rounded-lg" />
            <span className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight">
              Après-Ski
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map(({ href, label, Icon }) => {
              const active = isActive(href, pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-[var(--t-fast)] ${
                    active
                      ? "bg-accent/12 text-accent-ink"
                      : "text-ink-muted hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  <Icon className="size-[18px]" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-28 pt-5 md:px-6 md:pb-12 md:pt-8">
        {children}
      </main>

      {/* Mobile: bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-[var(--z-nav)] border-t border-border/70 bg-bg/85 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Navigation principale"
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
          {navItems.map(({ href, label, Icon }) => {
            const active = isActive(href, pathname);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors duration-[var(--t-fast)] ${
                    active ? "text-accent-ink" : "text-ink-muted active:text-ink"
                  }`}
                >
                  <span
                    className={`flex size-9 items-center justify-center rounded-full transition-colors duration-[var(--t-fast)] ${
                      active ? "bg-accent/15" : ""
                    }`}
                  >
                    <Icon className="size-[22px]" />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
