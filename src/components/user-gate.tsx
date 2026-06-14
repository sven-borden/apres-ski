"use client";

import { useEffect, useState } from "react";
import { useLocalUser, setLocalUser, makeAvatar } from "@/lib/user";
import { addParticipant } from "@/lib/actions";
import { PARTICIPANT_PALETTE } from "@/lib/palette";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { Input } from "@/components/form";

export function UserGate() {
  const user = useLocalUser();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PARTICIPANT_PALETTE[0].value);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  if (!mounted || user) return null;

  const trimmed = name.trim();
  const valid = trimmed.length >= 2;

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setBusy(true);
    setError("");
    try {
      const rec = await addParticipant({ name: trimmed, color, avatar: makeAvatar(trimmed) });
      setLocalUser({ id: rec.id, name: rec.name, color: rec.color, avatar: rec.avatar ?? makeAvatar(rec.name) });
    } catch {
      setError("Connexion impossible. Réessaie.");
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-title"
      className="fixed inset-0 z-[var(--z-modal)] grid place-items-center bg-[oklch(0.18_0.03_256/0.6)] p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <form onSubmit={join} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h1 id="join-title" className="text-xl font-extrabold tracking-tight">
              Bienvenue au chalet 🏔️
            </h1>
            <p className="text-sm text-ink-muted">Choisis ton prénom et ta couleur pour rejoindre l’équipe.</p>
          </div>

          <div className="flex items-center gap-4">
            <Avatar name={trimmed || "??"} color={color} size={56} />
            <div className="flex-1">
              <label htmlFor="join-name" className="mb-1.5 block text-sm font-medium text-ink-muted">
                Prénom
              </label>
              <Input
                id="join-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched(true)}
                autoFocus
                maxLength={100}
                placeholder="Ton prénom"
                aria-invalid={touched && !valid}
              />
              {touched && !valid && <p className="mt-1.5 text-xs font-medium text-danger">Au moins 2 caractères.</p>}
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
                      selected ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : "hover:scale-110"
                    }`}
                    style={{ background: c.value }}
                  />
                );
              })}
            </div>
          </fieldset>

          {error && <p className="text-sm font-medium text-danger">{error}</p>}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Connexion…" : "Rejoindre"}
          </Button>
        </form>
      </div>
    </div>
  );
}
