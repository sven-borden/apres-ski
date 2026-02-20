"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  addShoppingItem,
  toggleShoppingItem,
  removeShoppingItem,
} from "@/lib/actions/meals";
import { useUser } from "@/components/providers/UserProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { trackShoppingItemAdded, trackShoppingItemToggled, trackShoppingItemRemoved } from "@/lib/analytics";
import type { ShoppingItem, ShoppingUnit } from "@/lib/types";

export function ShoppingList({
  date,
  items,
}: {
  date: string;
  items: ShoppingItem[];
}) {
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnit, setNewUnit] = useState<ShoppingUnit | "">("");
  const [error, setError] = useState<string | null>(null);
  const [pendingRemoveItem, setPendingRemoveItem] = useState<{ id: string; text: string } | null>(null);
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
      ...(newQuantity && { quantity: parseFloat(newQuantity) }),
      ...(newUnit && { unit: newUnit }),
    };

    setNewItem("");
    setNewQuantity("");
    setNewUnit("");
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

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-midnight">{t.feasts.shopping_list}</h3>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1">{error}</p>
      )}

      {sorted.length > 0 && (
        <ul className="space-y-1.5">
          {sorted.map((item) => (
            <li key={item.id} className="flex items-center gap-2 group">
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
                  "text-sm flex-1",
                  item.checked
                    ? "line-through text-mist"
                    : "text-midnight",
                )}
              >
                {item.text}
                {item.quantity != null && (
                  <span className={cn("ml-1.5 text-xs font-medium", item.checked ? "text-mist" : "text-alpine")}>
                    {item.quantity}{item.unit ? `\u00a0${item.unit}` : ""}
                  </span>
                )}
              </span>
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

      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex gap-2">
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
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            placeholder={t.feasts.quantity_placeholder}
            min="0"
            step="any"
            className="w-20 rounded-lg border border-mist/30 bg-white/50 px-3 py-2 text-sm text-midnight placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-alpine/50"
          />
          <select
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value as ShoppingUnit | "")}
            className="rounded-lg border border-mist/30 bg-white/50 px-3 py-2 text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-alpine/50"
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
        </div>
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
    </div>
  );
}
