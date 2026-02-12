"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ParticipantPicker } from "@/components/feasts/ParticipantPicker";
import { updateDinner } from "@/lib/actions/meals";
import { useUser } from "@/components/providers/UserProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { inputClass } from "@/lib/utils/styles";
import type { Meal, Participant } from "@/lib/types";

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
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { user } = useUser();
  const { t } = useLocale();

  function toggleParticipant(id: string) {
    setResponsibleIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id];
      // Clear chef error when selection becomes non-empty
      if (next.length > 0 && fieldErrors.chefs) {
        setFieldErrors((fe) => {
          const updated = { ...fe };
          delete updated.chefs;
          return updated;
        });
      }
      return next;
    });
  }

  function validateAll(): boolean {
    const errors: Record<string, string> = {};
    if (responsibleIds.length === 0) {
      errors.chefs = t.validation.at_least_one_chef;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll()) return;

    setSaving(true);
    setError(null);
    try {
      await updateDinner(
        date,
        { responsibleIds, description: description.trim() },
        user?.id ?? "anonymous",
      );
      onClose();
    } catch {
      setError(t.errors.save_failed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.feasts.edit_dinner}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset>
          <legend className="block text-sm font-medium text-midnight mb-2">
            {t.feasts.whos_cooking}
          </legend>
          <ParticipantPicker
            participants={participants}
            selectedIds={responsibleIds}
            onToggle={toggleParticipant}
          />
          {fieldErrors.chefs && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {fieldErrors.chefs}
            </p>
          )}
        </fieldset>

        <div>
          <label htmlFor="dinner-description" className="block text-sm font-medium text-midnight mb-1.5">
            {t.feasts.whats_for_dinner}
          </label>
          <textarea
            id="dinner-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.feasts.placeholder_meal}
            rows={3}
            maxLength={500}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={saving || hasFieldErrors} className="flex-1">
            {saving ? t.common.saving : t.common.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
