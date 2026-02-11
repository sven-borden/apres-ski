"use client";

import { useEffect, useId, useRef, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

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
  const titleId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Lock body scroll
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

  // Focus management + keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    // Save the element that had focus before the modal opened
    previousFocusRef.current = document.activeElement;

    // Focus the first focusable element inside the modal (or the container itself)
    requestAnimationFrame(() => {
      const content = contentRef.current;
      if (!content) return;
      const firstFocusable = content.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        content.focus();
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }

      if (e.key === "Tab") {
        const content = contentRef.current;
        if (!content) return;
        const focusableElements = Array.from(
          content.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        );
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const content = contentRef.current;
    content?.addEventListener("keydown", handleKeyDown);

    return () => {
      content?.removeEventListener("keydown", handleKeyDown);

      // Restore focus to the previously focused element
      const prev = previousFocusRef.current;
      if (prev && prev instanceof HTMLElement && document.body.contains(prev)) {
        prev.focus();
      }
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(() => {
    onClose?.();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop — mouse-dismissible but invisible to screen readers */}
      <div
        className="absolute inset-0 bg-midnight/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full bg-glass backdrop-blur-md border border-glass-border shadow-xl",
          "rounded-t-2xl md:rounded-2xl",
          "max-h-[90vh] overflow-y-auto",
          "md:max-w-md md:mx-4",
          "p-6",
          "outline-none",
        )}
      >
        {title && (
          <h2 id={titleId} className="text-xl font-semibold text-midnight mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
