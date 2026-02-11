"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

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
  const { t } = useLocale();

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
        className="absolute inset-0 bg-midnight/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose?.();
        }}
        role={onClose ? "button" : undefined}
        tabIndex={onClose ? 0 : undefined}
        aria-label={onClose ? t.common.close : undefined}
      />
      <div
        className={cn(
          "relative z-10 w-full bg-glass backdrop-blur-md border border-glass-border shadow-xl",
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
