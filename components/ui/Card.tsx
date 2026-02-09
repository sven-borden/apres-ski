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
    <div className={cn("bg-glacier rounded-2xl shadow-sm p-5", className)}>
      {children}
    </div>
  );
}
