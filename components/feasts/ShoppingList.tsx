"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  addShoppingItem,
  toggleShoppingItem,
  removeShoppingItem,
  updateShoppingQuantities,
  resetShoppingQuantities,
  updateSingleItemQuantity,
  updateShoppingItemText,
  toggleExcludeFromShopping,
} from "@/lib/actions/meals";
import { useUser } from "@/components/providers/UserProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { trackShoppingItemAdded, trackShoppingItemToggled, trackShoppingItemRemoved, trackQuantitiesEstimated, trackQuantitiesReset } from "@/lib/analytics";
import type { ShoppingItem } from "@/lib/types";

export function ShoppingList({
  date,
  items,
  mealDescription,
  headcount,
  category = "dinner",
  excludeFromShopping,
}: {
  date: string;
  items: ShoppingItem[];
  mealDescription: string;
  headcount: number;
  category?: "dinner" | "general";
  excludeFromShopping?: boolean;
}) {
  const [newItem, setNewItem] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingRemoveItem, setPendingRemoveItem] = useState<{ id: string; text: string } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [pendingReset, setPendingReset] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState<{
    id: string;
    quantity: string;
    unit: string;
  } | null>(null);
  const [editingText, setEditingText] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const { user } = useUser();
  const { t } = useLocale();

  const userId = user?.id ?? "anonymous";
  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);
  const sorted = [...unchecked, ...checked];

  function showError(message: string) {
    setError(message);
    setTimeout(() => setError(null), 3000);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const text = newItem.trim();
    if (!text) return;

    const item: ShoppingItem = {
      id: crypto.randomUUID(),
      text,
      checked: false,
    };

    setNewItem("");
    try {
      await addShoppingItem(date, item, userId);
      trackShoppingItemAdded();
    } catch {
      showError(t.errors.add_failed);
    }
  }

  async function handleToggle(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    try {
      await toggleShoppingItem(date, itemId, userId);
      trackShoppingItemToggled(!item?.checked);
    } catch {
      showError(t.errors.toggle_failed);
    }
  }

  async function handleRemove(itemId: string) {
    try {
      await removeShoppingItem(date, itemId, userId);
      trackShoppingItemRemoved();
    } catch {
      showError(t.errors.delete_failed);
    }
  }

  async function handleEstimate() {
    const uncheckedItems = items.filter((i) => !i.checked && i.quantity == null);
    if (uncheckedItems.length === 0) return;
    if (category === "dinner" && !mealDescription) return;
    if (category === "general" && headcount < 1) return;

    setEstimating(true);
    try {
      const res = await fetch("/api/estimate-quantities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_ESTIMATE_API_TOKEN
            ? { Authorization: `Bearer ${process.env.NEXT_PUBLIC_ESTIMATE_API_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          ...(category === "dinner" ? { mealDescription } : {}),
          headcount,
          category,
          items: uncheckedItems.map((i) => ({ id: i.id, text: i.text })),
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          showError(t.feasts.estimate_rate_limited);
          return;
        }
        throw new Error("API error");
      }

      const data = await res.json();
      await updateShoppingQuantities(date, data.items, userId);
      trackQuantitiesEstimated(data.items.length);
    } catch {
      showError(t.feasts.estimate_error);
    } finally {
      setEstimating(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      await resetShoppingQuantities(date, userId);
      trackQuantitiesReset();
    } catch {
      showError(t.feasts.reset_error);
    } finally {
      setResetting(false);
    }
  }

  function startEditQuantity(item: ShoppingItem) {
    setEditingQuantity({
      id: item.id,
      quantity: item.quantity != null ? String(item.quantity) : "",
      unit: item.unit ?? "",
    });
  }

  async function saveQuantity() {
    if (!editingQuantity) return;
    const { id, quantity, unit } = editingQuantity;
    setEditingQuantity(null);
    const parsed = quantity.trim() === "" ? null : parseFloat(quantity);
    const resolvedUnit = unit || null;
    try {
      await updateSingleItemQuantity(
        date,
        id,
        parsed != null && !isNaN(parsed) ? parsed : null,
        resolvedUnit as import("@/lib/types").ShoppingUnit | null,
        userId,
      );
    } catch {
      showError(t.errors.toggle_failed);
    }
  }

  function cancelEditQuantity() {
    setEditingQuantity(null);
  }

  async function saveText() {
    if (!editingText) return;
    const { id, text } = editingText;
    const trimmed = text.trim();
    setEditingText(null);
    if (!trimmed) return;
    const original = items.find((i) => i.id === id);
    if (original && original.text === trimmed) return;
    try {
      await updateShoppingItemText(date, id, trimmed, userId);
    } catch {
      showError(t.errors.toggle_failed);
    }
  }

  const hasUnestimatedItems = items.some((i) => !i.checked && i.quantity == null);
  const canEstimate = category === "general"
    ? hasUnestimatedItems && headcount > 0
    : hasUnestimatedItems && !!mealDescription;
  const hasQuantities = items.some((i) => i.quantity != null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-midnight">{t.feasts.shopping_list}</h3>
        <div className="flex items-center gap-2">
          {hasQuantities && (
            <button
              type="button"
              onClick={() => setPendingReset(true)}
              disabled={resetting}
              className="text-xs font-medium text-mist hover:text-spritz disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resetting ? t.feasts.resetting : t.feasts.reset_quantities}
            </button>
          )}
          {canEstimate && (
            <button
              type="button"
              onClick={handleEstimate}
              disabled={estimating}
              className="text-xs font-medium text-alpine hover:text-alpine/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              {estimating ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.feasts.estimating}
                </>
              ) : (
                t.feasts.estimate_quantities
              )}
            </button>
          )}
        </div>
      </div>

      {excludeFromShopping !== undefined && (
        <div className="flex items-center gap-2 cursor-pointer select-none"
          onClick={async () => {
            if (!user) return;
            await toggleExcludeFromShopping(date, !excludeFromShopping, user.name);
          }}
          role="switch"
          aria-checked={excludeFromShopping}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!user) return;
              toggleExcludeFromShopping(date, !excludeFromShopping, user.name);
            }
          }}
        >
          <div
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
              excludeFromShopping ? "bg-alpine" : "bg-mist/30"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                excludeFromShopping ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-xs text-mist">
            {t.feasts.exclude_from_shopping}
          </span>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1">{error}</p>
      )}

      {sorted.length > 0 && (
        <ul className="grid gap-y-1.5 gap-x-2 items-center grid-cols-[auto_1fr_auto_auto]">
          {sorted.map((item) => (
            <li key={item.id} className="contents">
              <button
                type="button"
                role="checkbox"
                aria-checked={item.checked}
                aria-label={item.checked ? t.feasts.mark_unpurchased(item.text) : t.feasts.mark_purchased(item.text)}
                onClick={() => handleToggle(item.id)}
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                  item.checked
                    ? "bg-pine border-pine text-white"
                    : "border-mist/40 hover:border-alpine",
                )}
              >
                {item.checked && (
                  <svg
                    aria-hidden="true"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </button>
              {editingText?.id === item.id ? (
                <input
                  type="text"
                  value={editingText.text}
                  onChange={(e) => setEditingText({ ...editingText, text: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveText();
                    if (e.key === "Escape") setEditingText(null);
                  }}
                  onBlur={saveText}
                  autoFocus
                  maxLength={100}
                  className="text-sm rounded border border-alpine/40 bg-white/60 px-1 py-0.5 text-midnight focus:outline-none focus:ring-1 focus:ring-alpine/50 min-w-0"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingText({ id: item.id, text: item.text })}
                  className={cn(
                    "text-sm whitespace-nowrap text-left hover:underline decoration-mist/30",
                    item.checked
                      ? "line-through text-mist"
                      : "text-midnight",
                  )}
                >
                  {item.text}
                </button>
              )}
              {editingQuantity?.id === item.id ? (
                <span
                  className="flex items-center gap-1"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) saveQuantity();
                  }}
                >
                  <input
                    type="number"
                    value={editingQuantity.quantity}
                    onChange={(e) => setEditingQuantity({ ...editingQuantity, quantity: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveQuantity();
                      if (e.key === "Escape") cancelEditQuantity();
                    }}
                    autoFocus
                    className="w-14 text-xs text-right rounded border border-alpine/40 bg-white/60 px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-alpine/50"
                    placeholder={t.feasts.quantity_placeholder}
                    min={0}
                    step="any"
                  />
                  <select
                    value={editingQuantity.unit}
                    onChange={(e) => setEditingQuantity({ ...editingQuantity, unit: e.target.value })}
                    className="text-xs rounded border border-alpine/40 bg-white/60 px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-alpine/50"
                  >
                    <option value="">—</option>
                    <option value="kg">{t.feasts.unit_kg}</option>
                    <option value="g">{t.feasts.unit_g}</option>
                    <option value="L">{t.feasts.unit_l}</option>
                    <option value="dL">{t.feasts.unit_dl}</option>
                    <option value="cl">{t.feasts.unit_cl}</option>
                    <option value="pcs">{t.feasts.unit_pcs}</option>
                    <option value="bottles">{t.feasts.unit_bottles}</option>
                    <option value="packs">{t.feasts.unit_packs}</option>
                  </select>
                </span>
              ) : item.quantity != null ? (
                <button
                  type="button"
                  onClick={() => startEditQuantity(item)}
                  className={cn("text-xs font-medium text-left hover:underline", item.checked ? "text-mist" : "text-alpine")}
                >
                  {item.quantity}{item.unit ? `\u00a0${item.unit}` : ""}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startEditQuantity(item)}
                  className="text-xs text-mist/40 hover:text-alpine transition-colors"
                  aria-label="Add quantity"
                >
                  +
                </button>
              )}
              <button
                type="button"
                onClick={() => setPendingRemoveItem({ id: item.id, text: item.text })}
                className="text-mist hover:text-red-500 transition-colors p-1"
                aria-label={`${t.common.remove} ${item.text}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M3 3l8 8M11 3l-8 8" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={t.feasts.placeholder_item}
          maxLength={100}
          className="flex-1 rounded-lg border border-mist/30 bg-white/50 px-3 py-2 text-sm text-midnight placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-alpine/50"
        />
        <button
          type="submit"
          disabled={!newItem.trim()}
          className="rounded-lg bg-alpine px-3 py-2 text-sm font-medium text-white hover:bg-alpine/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t.common.add}
        </button>
      </form>

      <ConfirmDialog
        isOpen={pendingRemoveItem !== null}
        onClose={() => setPendingRemoveItem(null)}
        onConfirm={() => {
          if (pendingRemoveItem) handleRemove(pendingRemoveItem.id);
        }}
        title={t.confirm.remove_shopping_item_title}
        message={pendingRemoveItem ? t.confirm.remove_shopping_item_message(pendingRemoveItem.text) : ""}
        confirmLabel={t.confirm.confirm_remove}
      />

      <ConfirmDialog
        isOpen={pendingReset}
        onClose={() => setPendingReset(false)}
        onConfirm={handleReset}
        title={t.confirm.reset_quantities_title}
        message={t.confirm.reset_quantities_message}
        confirmLabel={t.confirm.confirm_reset}
        variant="warn"
      />
    </div>
  );
}
