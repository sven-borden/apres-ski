"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import {
  UNITS,
  estimateQuantities,
  newItemId,
  type Estimate,
  type ShoppingItem,
  type Unit,
} from "@/lib/feasts";

const SINGULAR: Partial<Record<Unit, string>> = {
  bottles: "bouteille",
  packs: "paquet",
  pcs: "pièce",
};

function formatQty(quantity: number, unit?: Unit) {
  const label = (quantity === 1 && unit && SINGULAR[unit]) || UNITS.find((u) => u.value === unit)?.label || "";
  return `${quantity} ${label}`.trim();
}

export function ShoppingList({
  items,
  setItems,
  category,
  headcount,
  description,
  exclude,
}: {
  items: ShoppingItem[];
  setItems: (items: ShoppingItem[]) => void;
  category: "dinner" | "general";
  headcount: number;
  description?: string;
  exclude?: { value: boolean; onChange: (v: boolean) => void };
}) {
  const [draft, setDraft] = useState("");
  const [editTextId, setEditTextId] = useState<string | null>(null);
  const [editTextValue, setEditTextValue] = useState("");
  const [editQtyId, setEditQtyId] = useState<string | null>(null);
  const [justChecked, setJustChecked] = useState<Set<string>>(new Set());
  const [estimating, setEstimating] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: "remove"; item: ShoppingItem } | { kind: "reset" } | null>(null);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const toast = useToast();

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  // Unchecked first; a just-checked row lingers in place ~2s before sinking.
  const ordered = [...items].sort((a, b) => {
    const aDown = a.checked && !justChecked.has(a.id);
    const bDown = b.checked && !justChecked.has(b.id);
    return Number(aDown) - Number(bDown);
  });

  const hasQuantities = items.some((i) => i.quantity != null);
  const missingQty = items.filter((i) => !i.checked && i.quantity == null);
  const canEstimate =
    missingQty.length > 0 && (category === "dinner" ? !!description?.trim() : headcount >= 1);

  function patch(id: string, p: Partial<ShoppingItem>) {
    setItems(items.map((i) => (i.id === id ? { ...i, ...p } : i)));
  }

  function addItems() {
    const lines = draft.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    setItems([...items, ...lines.map((text) => ({ id: newItemId(), text, checked: false }))]);
    setDraft("");
  }

  function toggle(it: ShoppingItem) {
    const nowChecked = !it.checked;
    patch(it.id, { checked: nowChecked });
    const t = timers.current.get(it.id);
    if (t) clearTimeout(t);
    if (nowChecked) {
      setJustChecked((s) => new Set(s).add(it.id));
      const timer = setTimeout(() => {
        setJustChecked((s) => {
          const n = new Set(s);
          n.delete(it.id);
          return n;
        });
        timers.current.delete(it.id);
      }, 2000);
      timers.current.set(it.id, timer);
    } else {
      setJustChecked((s) => {
        const n = new Set(s);
        n.delete(it.id);
        return n;
      });
    }
  }

  function commitText(it: ShoppingItem) {
    const v = editTextValue.trim();
    if (v && v !== it.text) patch(it.id, { text: v });
    setEditTextId(null);
  }

  function setQuantity(it: ShoppingItem, raw: string) {
    if (raw === "") {
      patch(it.id, { quantity: undefined, unit: undefined });
      return;
    }
    const n = Math.max(0, Number(raw));
    patch(it.id, { quantity: n, unit: it.unit ?? "pcs" });
  }

  async function runEstimate() {
    setEstimating(true);
    const payload = {
      category,
      headcount,
      description,
      items: missingQty.map((i) => ({ id: i.id, text: i.text })),
    };
    let estimates: Estimate[];
    try {
      const res = await fetch("/api/ai/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      estimates = (await res.json()).estimates as Estimate[];
    } catch {
      // Degrade gracefully: keep the feature working with the local heuristic.
      toast("Estimation IA indisponible — quantités approximatives.", "error");
      estimates = estimateQuantities(category, headcount, payload.items);
    }
    const byId = new Map(estimates.map((e) => [e.id, e]));
    setItems(
      items.map((i) => {
        const e = byId.get(i.id);
        if (!e || i.quantity != null || e.quantity == null) return i; // never overwrite manual
        return { ...i, quantity: e.quantity, unit: e.unit ?? undefined };
      }),
    );
    setEstimating(false);
  }

  function doConfirm() {
    if (!confirm) return;
    if (confirm.kind === "remove") setItems(items.filter((i) => i.id !== confirm.item.id));
    else setItems(items.map((i) => ({ ...i, quantity: undefined, unit: undefined })));
    setConfirm(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-ink-muted">Liste de courses</h4>
        <div className="flex items-center gap-1">
          {canEstimate && (
            <Button
              type="button"
              variant="secondary"
              onClick={runEstimate}
              disabled={estimating}
              className="h-9 min-h-0 px-3 text-xs"
            >
              {estimating ? <Spinner /> : <SparkIcon />}
              {estimating ? "Estimation…" : "Estimer les quantités"}
            </Button>
          )}
          {hasQuantities && (
            <button
              type="button"
              onClick={() => setConfirm({ kind: "reset" })}
              className="rounded-full px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-[var(--radius-sm)] bg-surface-2 px-3 py-4 text-center text-sm text-ink-muted">
          Rien à acheter pour l’instant. Ajoute des articles ci-dessous.
        </p>
      ) : (
        <ul className="flex flex-col">
          {ordered.map((it) => {
            const editing = editTextId === it.id;
            const qtyEditing = editQtyId === it.id;
            return (
              <li
                key={it.id}
                className="group flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border py-2 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => toggle(it)}
                  role="checkbox"
                  aria-checked={it.checked}
                  aria-label={`${it.text}${it.checked ? " — acheté" : ""}`}
                  className={`grid size-6 shrink-0 place-items-center rounded-[6px] border-2 transition-all duration-[var(--t-fast)] ease-[var(--ease-out)] active:scale-90 ${
                    it.checked
                      ? "border-present bg-present text-on-accent"
                      : "border-border hover:border-accent"
                  }`}
                >
                  {it.checked && (
                    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                      <path d="m5 12.5 4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {editing ? (
                  <input
                    autoFocus
                    value={editTextValue}
                    onChange={(e) => setEditTextValue(e.target.value)}
                    onBlur={() => commitText(it)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitText(it);
                      if (e.key === "Escape") setEditTextId(null);
                    }}
                    maxLength={100}
                    className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-accent bg-bg px-2 py-1 text-sm outline-none ring-2 ring-accent/30"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditTextId(it.id);
                      setEditTextValue(it.text);
                    }}
                    className={`min-w-[7rem] flex-1 truncate text-left text-sm transition-colors ${
                      it.checked ? "text-ink-muted line-through" : "text-ink"
                    }`}
                  >
                    {it.text}
                  </button>
                )}

                {qtyEditing ? (
                  <span className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      autoFocus
                      value={it.quantity ?? ""}
                      onChange={(e) => setQuantity(it, e.target.value)}
                      className="nums w-16 rounded-[var(--radius-sm)] border border-accent bg-bg px-2 py-1 text-sm outline-none ring-2 ring-accent/30"
                    />
                    <select
                      value={it.unit ?? "pcs"}
                      onChange={(e) => patch(it.id, { unit: e.target.value as Unit, quantity: it.quantity ?? 1 })}
                      className="rounded-[var(--radius-sm)] border border-border bg-bg py-1 pl-2 pr-1 text-sm outline-none focus-visible:border-accent"
                    >
                      {UNITS.map((u) => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setEditQtyId(null)}
                      aria-label="Terminer"
                      className="grid size-7 place-items-center rounded-[var(--radius-sm)] text-present hover:bg-surface-2"
                    >
                      <svg viewBox="0 0 24 24" className="size-4" aria-hidden><path d="m5 12.5 4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditQtyId(it.id)}
                    className={`nums shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                      it.quantity != null
                        ? "bg-surface-2 text-ink"
                        : "text-ink-muted hover:bg-surface-2 hover:text-ink"
                    }`}
                  >
                    {it.quantity != null ? formatQty(it.quantity, it.unit) : "+ qté"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setConfirm({ kind: "remove", item: it })}
                  aria-label={`Retirer ${it.text}`}
                  className="grid size-7 shrink-0 place-items-center rounded-[var(--radius-sm)] text-ink-muted opacity-0 transition-all hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden><path d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add items */}
      <div className="flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addItems();
            }
          }}
          rows={1}
          placeholder="Ajouter un article (un par ligne)…"
          className="max-h-28 min-h-11 flex-1 resize-none rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-ink-muted/70 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
        />
        <Button type="button" onClick={addItems} disabled={!draft.trim()} className="h-11">
          Ajouter
        </Button>
      </div>

      {exclude && (
        <label className="mt-1 flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2.5">
          <span className="text-sm">
            <span className="font-medium">Exclure des courses</span>
            <span className="block text-xs text-ink-muted">Ex. : ce soir on mange au restaurant.</span>
          </span>
          <Switch checked={exclude.value} onChange={exclude.onChange} label="Exclure ce jour des courses" />
        </label>
      )}

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm?.kind === "remove"
            ? `Retirer « ${confirm.item.text} » ?`
            : "Réinitialiser les quantités ?"
        }
        body={
          confirm?.kind === "remove"
            ? "L’article sera retiré de cette liste."
            : "Toutes les quantités et unités de cette liste seront effacées."
        }
        confirmLabel={confirm?.kind === "remove" ? "Retirer" : "Réinitialiser"}
        onConfirm={doConfirm}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-[var(--t-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        checked ? "bg-accent" : "bg-border"
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-bg shadow-sm transition-transform duration-[var(--t-fast)] ease-[var(--ease-out)] ${
          checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M18.5 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" fill="currentColor" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
