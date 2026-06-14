"use client";

import { useId, useMemo, useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/form";
import { assignedMealDates } from "@/lib/basecamp";

export type TripDraft = { name: string; startISO: string; endISO: string };

export function TripEditor({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: TripDraft;
  onClose: () => void;
  onSave: (draft: TripDraft) => void;
}) {
  const nameId = useId();
  const startId = useId();
  const endId = useId();
  const [name, setName] = useState(initial.name);
  const [start, setStart] = useState(initial.startISO);
  const [end, setEnd] = useState(initial.endISO);
  const [touched, setTouched] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const nameError = touched && name.trim().length < 1 ? "Donne un nom au séjour." : "";
  const dateError = touched && end < start ? "La fin doit suivre le début." : "";
  const valid = name.trim().length >= 1 && end >= start;

  // Meals already assigned that would fall outside the new range.
  const orphaned = useMemo(
    () => assignedMealDates.filter((d) => d < start || d > end),
    [start, end],
  );

  function changeDates(next: () => void) {
    next();
    setAcknowledged(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    if (orphaned.length > 0 && !acknowledged) {
      setAcknowledged(true); // reveal the warning; next click confirms
      return;
    }
    onSave({ name: name.trim(), startISO: start, endISO: end });
  }

  const showWarning = valid && orphaned.length > 0 && acknowledged;

  return (
    <Modal open={open} onClose={onClose} title="Modifier le séjour" width="30rem">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Nom du séjour" htmlFor={nameId} error={nameError}>
          <Input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            maxLength={200}
            placeholder="Verbier 2026"
            aria-invalid={!!nameError}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Début" htmlFor={startId}>
            <Input
              id={startId}
              type="date"
              value={start}
              onChange={(e) => changeDates(() => setStart(e.target.value))}
            />
          </Field>
          <Field label="Fin" htmlFor={endId} error={dateError}>
            <Input
              id={endId}
              type="date"
              value={end}
              min={start}
              onChange={(e) => changeDates(() => setEnd(e.target.value))}
              aria-invalid={!!dateError}
            />
          </Field>
        </div>

        {showWarning && (
          <div
            role="alert"
            className="flex gap-3 rounded-[var(--radius-sm)] border border-warn/40 bg-warn/12 p-3 text-sm"
          >
            <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden>
              <path
                d="M12 9v4m0 3.5h.01M10.3 4.3 2.7 17.5A2 2 0 0 0 4.4 20.5h15.2a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-ink">
              {orphaned.length === 1
                ? "1 repas planifié"
                : `${orphaned.length} repas planifiés`}{" "}
              tomberai{orphaned.length === 1 ? "t" : "ent"} hors des nouvelles dates. Ces
              plans ne seront plus visibles.
            </p>
          </div>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant={showWarning ? "danger" : "primary"} disabled={!valid && touched}>
            {showWarning ? "Enregistrer quand même" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
