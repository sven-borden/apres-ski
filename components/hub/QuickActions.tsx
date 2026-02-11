"use client";

import Link from "next/link";

const actions = [
  { label: "Mark Attendance", href: "/lineup" },
  { label: "Plan a Meal", href: "/feasts" },
  { label: "Chalet Info", href: "/basecamp" },
] as const;

export function QuickActions() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="rounded-full px-5 py-2.5 font-medium border border-alpine text-alpine hover:bg-alpine/5 transition-colors text-sm"
        >
          {a.label}
        </Link>
      ))}
    </div>
  );
}
