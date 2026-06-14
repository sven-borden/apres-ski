"use client";

import { useEffect, useRef } from "react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = "28rem",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Close when the backdrop (the dialog box itself) is clicked.
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const inside =
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom;
        if (!inside) onClose();
      }}
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-desc" : undefined}
      className="w-[calc(100vw-2rem)]"
      style={{ maxWidth: width }}
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 id="modal-title" className="text-xl font-extrabold tracking-tight">
            {title}
          </h2>
          {description && (
            <p id="modal-desc" className="text-sm text-ink-muted">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </dialog>
  );
}
