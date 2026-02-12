"use client";

import { cn } from "@/lib/utils/cn";

export function Avatar({
  initials,
  color,
  size = "md",
  name,
}: {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  name?: string;
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
        sizeClasses[size],
      )}
      style={{ backgroundColor: color }}
      {...(name
        ? { role: "img", "aria-label": name }
        : { "aria-hidden": true })}
    >
      {initials}
    </div>
  );
}
