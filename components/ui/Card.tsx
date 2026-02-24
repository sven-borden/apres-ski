"use client";

import { cn } from "@/lib/utils/cn";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-glass backdrop-blur-sm border border-glass-border rounded-2xl shadow-lg p-5", className)}>
      {children}
    </div>
  );
}
