"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Tone = "error" | "info" | "success";
type Toast = { id: number; message: string; tone: Tone };
type Push = (message: string, tone?: Tone) => void;

const ToastContext = createContext<Push>(() => {});

export function useToast(): Push {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback<Push>((message, tone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[var(--z-toast)] flex flex-col items-center gap-2 px-4 md:bottom-8"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-md ${
              t.tone === "error"
                ? "border-danger/30 bg-danger/12 text-danger"
                : t.tone === "success"
                  ? "border-present/30 bg-present/12 text-present"
                  : "border-border bg-surface text-ink"
            }`}
            style={{ animation: "toast-in var(--t-base) var(--ease-out)" }}
          >
            {t.tone === "error" && (
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden>
                <path d="M12 8v5m0 3h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
