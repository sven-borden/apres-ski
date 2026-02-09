"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";

export function Modal({
  isOpen,
  onClose,
  children,
  title,
}: {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-midnight/50"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose?.();
        }}
        role={onClose ? "button" : undefined}
        tabIndex={onClose ? 0 : undefined}
        aria-label={onClose ? "Close modal" : undefined}
      />
      <div
        className={cn(
          "relative z-10 w-full bg-glacier",
          "rounded-t-2xl md:rounded-2xl",
          "max-h-[90vh] overflow-y-auto",
          "md:max-w-md md:mx-4",
          "p-6",
        )}
      >
        {title && (
          <h2 className="text-xl font-semibold text-midnight mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
