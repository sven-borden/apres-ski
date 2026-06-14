"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/button";
import { Avatar } from "@/components/avatar";
import { Field, Textarea } from "@/components/form";
import type { Participant } from "@/lib/crew";

export function DinnerEditor({
  open,
  participants,
  initialChefs,
  initialDescription,
  onClose,
  onSave,
}: {
  open: boolean;
  participants: Participant[];
  initialChefs: string[];
  initialDescription: string;
  onClose: () => void;
  onSave: (chefs: string[], description: string) => void;
}) {
  const [chefs, setChefs] = useState<Set<string>>(new Set(initialChefs));
  const [description, setDescription] = useState(initialDescription);
  const [touched, setTouched] = useState(false);

  const valid = chefs.size > 0 || description.trim().length > 0;

  function toggleChef(id: string) {
    setChefs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSave([...chefs], description.trim());
  }

  return (
    <Modal open={open} onClose={onClose} title="Modifier le dîner" width="32rem">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-ink-muted">Qui cuisine&nbsp;?</legend>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => {
              const on = chefs.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleChef(p.id)}
                  aria-pressed={on}
                  className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm font-medium transition-colors duration-[var(--t-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    on
                      ? "border-accent bg-accent/12 text-accent-ink"
                      : "border-border text-ink-muted hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  <Avatar name={p.name} color={p.color} size={24} />
                  {p.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <Field label="Au menu" hint="Décris le plat (raclette, curry, …).">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Raclette + salade verte"
          />
        </Field>

        {touched && !valid && (
          <p className="text-sm font-medium text-danger">
            Choisis au moins un chef ou décris le plat.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit">Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}
