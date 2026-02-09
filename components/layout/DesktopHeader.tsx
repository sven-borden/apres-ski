"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { label: "Hub", href: "/" },
  { label: "Crew", href: "/crew" },
  { label: "Basecamp", href: "/basecamp" },
];

export function DesktopHeader() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-glacier/80 backdrop-blur-sm border-b border-mist/20">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-midnight">
          <Image src="/logo.png" alt="" width={32} height={32} className="rounded-md" />
          Apres-Ski
        </Link>
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
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
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
