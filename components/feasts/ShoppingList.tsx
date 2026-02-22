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
}: {
  date: string;
  items: ShoppingItem[];
  mealDescription: string;
  headcount: number;
}) {
  const [newItem, setNewItem] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingRemoveItem, setPendingRemoveItem] = useState<{ id: string; text: string } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [pendingReset, setPendingReset] = useState(false);
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
    const uncheckedItems = items.filter((i) => !i.checked);
    if (uncheckedItems.length === 0 || !mealDescription) return;

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
          mealDescription,
          headcount,
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

  const canEstimate = items.some((i) => !i.checked) && !!mealDescription;
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

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1">{error}</p>
      )}

      {sorted.length > 0 && (
        <ul className="grid gap-y-1.5 gap-x-2 items-center grid-cols-[auto_max-content_1fr_auto]">
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
              <span
                className={cn(
                  "text-sm whitespace-nowrap",
                  item.checked
                    ? "line-through text-mist"
                    : "text-midnight",
                )}
              >
                {item.text}
              </span>
              {item.quantity != null ? (
                <span className={cn("text-xs font-medium", item.checked ? "text-mist" : "text-alpine")}>
                  {item.quantity}{item.unit ? `\u00a0${item.unit}` : ""}
                </span>
              ) : (
                <span />
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
