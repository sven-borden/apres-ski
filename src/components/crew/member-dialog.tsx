"use client";

import { useId, useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/button";
import { Avatar } from "@/components/avatar";
import { Input } from "@/components/form";
import { PARTICIPANT_PALETTE } from "@/lib/palette";
import type { Participant } from "@/lib/crew";

export type MemberDraft = { name: string; color: string };

export function MemberDialog({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: Participant | null;
  onClose: () => void;
  onSave: (draft: MemberDraft, editingId: string | null) => void;
}) {
  // Parent remounts this component (via `key`) on each open, so plain
  // initializers give a fresh form keyed to the member being edited.
  const nameId = useId();
  const [name, setName] = useState(editing?.name ?? "");
  const [color, setColor] = useState(editing?.color ?? PARTICIPANT_PALETTE[0].value);
  const [touched, setTouched] = useState(false);

  const trimmed = name.trim();
  const valid = trimmed.length >= 2;
  const previewName = trimmed || "??";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSave({ name: trimmed, color }, editing?.id ?? null);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Modifier le membre" : "Ajouter un membre"}
      description={
        editing
          ? "Mets à jour le nom ou la couleur."
          : "Ajoute quelqu’un à l’équipe du chalet."
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <Avatar name={previewName} color={color} size={56} />
          <div className="flex-1">
            <label
              htmlFor={nameId}
              className="mb-1.5 block text-sm font-medium text-ink-muted"
            >
              Nom
            </label>
            <Input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              autoFocus
              maxLength={100}
              placeholder="Prénom"
              aria-invalid={touched && !valid}
            />
            {touched && !valid && (
              <p className="mt-1.5 text-xs font-medium text-danger">
                Au moins 2 caractères.
              </p>
            )}
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-ink-muted">Couleur</legend>
          <div className="flex flex-wrap gap-2.5">
            {PARTICIPANT_PALETTE.map((c) => {
              const selected = c.value === color;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.value)}
                  aria-pressed={selected}
                  aria-label={c.id}
                  className={`size-9 rounded-full transition-transform duration-[var(--t-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    selected
                      ? "ring-2 ring-ink ring-offset-2 ring-offset-surface"
                      : "hover:scale-110"
                  }`}
                  style={{ background: c.value }}
                >
                  {selected && (
                    <svg viewBox="0 0 24 24" className="m-auto size-5 text-on-accent" aria-hidden>
                      <path
                        d="m5 12.5 4.5 4.5L19 7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={touched && !valid}>
            {editing ? "Enregistrer" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
