"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "danger",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "danger" | "warn";
}) {
  const { t } = useLocale();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-midnight/80 mb-6">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          {cancelLabel ?? t.common.cancel}
        </Button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`flex-1 rounded-full px-5 py-2.5 font-medium text-white transition-colors ${
            variant === "danger"
              ? "bg-spritz hover:bg-spritz/90"
              : "bg-amber-500 hover:bg-amber-500/90"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
