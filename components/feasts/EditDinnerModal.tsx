"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ParticipantPicker } from "@/components/feasts/ParticipantPicker";
import { updateDinner } from "@/lib/actions/meals";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Meal, Participant } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-mist/30 bg-white/50 px-4 py-2.5 text-midnight placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-alpine/50";

export function EditDinnerModal({
  isOpen,
  onClose,
  date,
  meal,
  participants,
}: {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  meal: Meal | undefined;
  participants: Participant[];
}) {
  const [responsibleIds, setResponsibleIds] = useState<string[]>(
    meal?.responsibleIds ?? [],
  );
  const [description, setDescription] = useState(meal?.description ?? "");
  const [saving, setSaving] = useState(false);
  const { t } = useLocale();

  function toggleParticipant(id: string) {
    setResponsibleIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDinner(
        date,
        { responsibleIds, description: description.trim() },
        "anonymous",
      );
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.feasts.edit_dinner}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-midnight mb-2">
            {t.feasts.whos_cooking}
          </label>
          <ParticipantPicker
            participants={participants}
            selectedIds={responsibleIds}
            onToggle={toggleParticipant}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-midnight mb-1.5">
            {t.feasts.whats_for_dinner}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.feasts.placeholder_meal}
            rows={3}
            className={inputClass}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? t.common.saving : t.common.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
