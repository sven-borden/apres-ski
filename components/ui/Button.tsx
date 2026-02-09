"use client";

import { cn } from "@/lib/utils/cn";

export function Button({
  variant = "primary",
  children,
  onClick,
  disabled,
  type = "button",
  className,
}: {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full px-5 py-2.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" && "bg-alpine text-white hover:bg-alpine/90",
        variant === "secondary" &&
          "border border-alpine text-alpine hover:bg-alpine/5",
        className,
      )}
    >
      {children}
    </button>
  );
}
