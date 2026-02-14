"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { PARTICIPANT_COLORS, getInitials } from "@/lib/utils/colors";
import { inputClass } from "@/lib/utils/styles";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { trackCrewMemberEdited } from "@/lib/analytics";
import type { Participant } from "@/lib/types";

export function EditCrewModal({
  isOpen,
  onClose,
  participant,
}: {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant;
}) {
  const [name, setName] = useState(participant.name);
  const [selectedColor, setSelectedColor] = useState<string>(participant.color);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    if (isOpen) {
      setName(participant.name);
      setSelectedColor(participant.color);
      setError(null);
    }
  }, [isOpen, participant.name, participant.color]);

  const initials = getInitials(name);
  const hasChanges = name.trim() !== participant.name || selectedColor !== participant.color;
  const canSubmit = name.trim().length >= 2 && hasChanges && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError(null);
    try {
      const db = getDb();
      const trimmed = name.trim();
      await updateDoc(doc(db, "participants", participant.id), {
        name: trimmed,
        avatar: getInitials(trimmed),
        color: selectedColor,
        updatedAt: serverTimestamp(),
      });
      trackCrewMemberEdited();
      onClose();
    } catch {
      setError(t.errors.save_failed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.crew.edit_member}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="edit-crew-name"
            className="block text-sm font-medium text-midnight mb-1.5"
          >
            {t.crew.name}
          </label>
          <input
            id="edit-crew-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.crew.placeholder_name}
            className={inputClass}
            autoFocus
          />
        </div>

        <div>
          <p className="text-sm font-medium text-midnight mb-2">{t.crew.color}</p>
          <div className="flex flex-wrap gap-2">
            {PARTICIPANT_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setSelectedColor(c.hex)}
                className="w-9 h-9 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c.hex,
                  outline:
                    selectedColor === c.hex
                      ? "3px solid var(--midnight-slate)"
                      : "2px solid transparent",
                  outlineOffset: "2px",
                }}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>

        {initials && (
          <div className="flex items-center gap-3">
            <Avatar initials={initials} color={selectedColor} size="lg" />
            <span className="text-sm text-mist">{t.common.preview}</span>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={!canSubmit} className="flex-1">
            {saving ? t.common.saving : t.common.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
