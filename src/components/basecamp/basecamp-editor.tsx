"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/button";
import { Field, Input, Textarea } from "@/components/form";
import type { Basecamp, EmergencyContact } from "@/lib/basecamp";

export function BasecampEditor({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Basecamp;
  onClose: () => void;
  onSave: (next: Basecamp) => void;
}) {
  const [draft, setDraft] = useState<Basecamp>(initial);

  function set<K extends keyof Basecamp>(key: K, value: Basecamp[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setContact(i: number, patch: Partial<EmergencyContact>) {
    setDraft((d) => ({
      ...d,
      emergencyContacts: d.emergencyContacts.map((c, j) => (j === i ? { ...c, ...patch } : c)),
    }));
  }

  function addContact() {
    setDraft((d) => ({
      ...d,
      emergencyContacts: [...d.emergencyContacts, { name: "", phone: "", role: "" }],
    }));
  }

  function removeContact(i: number) {
    setDraft((d) => ({
      ...d,
      emergencyContacts: d.emergencyContacts.filter((_, j) => j !== i),
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...draft,
      name: draft.name.trim(),
      emergencyContacts: draft.emergencyContacts.filter((c) => c.name.trim() || c.phone.trim()),
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Modifier le chalet" width="34rem">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="-mr-1 flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <Field label="Nom du chalet">
            <Input value={draft.name} onChange={(e) => set("name", e.target.value)} maxLength={120} />
          </Field>

          <Field label="Adresse" hint="Une ligne par élément.">
            <Textarea
              value={draft.address}
              onChange={(e) => set("address", e.target.value)}
              rows={3}
              maxLength={400}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Réseau Wi-Fi">
              <Input
                value={draft.wifi.network}
                onChange={(e) => set("wifi", { ...draft.wifi, network: e.target.value })}
                maxLength={64}
              />
            </Field>
            <Field label="Mot de passe Wi-Fi">
              <Input
                value={draft.wifi.password}
                onChange={(e) => set("wifi", { ...draft.wifi, password: e.target.value })}
                maxLength={64}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Check-in">
              <Input value={draft.checkIn} onChange={(e) => set("checkIn", e.target.value)} maxLength={40} />
            </Field>
            <Field label="Check-out">
              <Input value={draft.checkOut} onChange={(e) => set("checkOut", e.target.value)} maxLength={40} />
            </Field>
            <Field label="Couchages">
              <Input
                type="number"
                min={0}
                max={200}
                value={draft.capacity}
                onChange={(e) => set("capacity", Number(e.target.value))}
              />
            </Field>
          </div>

          <Field label="Lien Tricount" hint="Laisser vide pour masquer.">
            <Input
              type="url"
              value={draft.tricountUrl}
              onChange={(e) => set("tricountUrl", e.target.value)}
              placeholder="https://tricount.com/…"
            />
          </Field>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-ink-muted">Contacts d’urgence</legend>
            <div className="flex flex-col gap-2">
              {draft.emergencyContacts.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="grid flex-1 grid-cols-2 gap-2">
                    <Input
                      aria-label={`Nom du contact ${i + 1}`}
                      value={c.name}
                      onChange={(e) => setContact(i, { name: e.target.value })}
                      placeholder="Nom"
                    />
                    <Input
                      aria-label={`Téléphone du contact ${i + 1}`}
                      value={c.phone}
                      onChange={(e) => setContact(i, { phone: e.target.value })}
                      placeholder="Téléphone"
                      inputMode="tel"
                    />
                    <Input
                      aria-label={`Rôle du contact ${i + 1}`}
                      value={c.role ?? ""}
                      onChange={(e) => setContact(i, { role: e.target.value })}
                      placeholder="Rôle (optionnel)"
                      className="col-span-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeContact(i)}
                    aria-label={`Retirer le contact ${i + 1}`}
                    className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                      <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <Button type="button" variant="secondary" onClick={addContact} className="mt-1 self-start">
              + Ajouter un contact
            </Button>
          </fieldset>

          <Field label="Notes" hint="Règles de la maison, parking, tri…">
            <Textarea value={draft.notes} onChange={(e) => set("notes", e.target.value)} rows={4} maxLength={5000} />
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit">Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}
