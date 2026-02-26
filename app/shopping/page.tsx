"use client";

import { Suspense, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { useTrip } from "@/lib/hooks/useTrip";
import { useMeals } from "@/lib/hooks/useMeals";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useUser } from "@/components/providers/UserProvider";
import { useConsolidatedShopping, groupByCategory, type ConsolidatedItem } from "@/lib/hooks/useConsolidatedShopping";
import { trackSmartMerge, trackConsolidatedToggle } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";

function QuantityDisplay({ item }: { item: ConsolidatedItem }) {
  const { t } = useLocale();
  if (!item.sum) return null;

  const unitLabel = (unit: string) => {
    const key = `unit_${unit.toLowerCase()}` as keyof typeof t.feasts;
    return (t.feasts[key] as string) ?? unit;
  };

  if (item.sum.kind === "single") {
    return (
      <span className="text-sm text-mist ml-2 shrink-0">
        {item.sum.result.total} {unitLabel(item.sum.result.unit)}
      </span>
    );
  }

  return (
    <span className="text-sm text-mist ml-2 shrink-0">
      {item.sum.entries.map((e, i) => (
        <span key={e.unit}>
          {i > 0 && " + "}
          {e.total} {unitLabel(e.unit)}
        </span>
      ))}
    </span>
  );
}

function SourceDetails({ sources }: { sources: ConsolidatedItem["sources"] }) {
  const { t } = useLocale();

  const unitLabel = (unit: string) => {
    const key = `unit_${unit.toLowerCase()}` as keyof typeof t.feasts;
    return (t.feasts[key] as string) ?? unit;
  };

  return (
    <ul className="mt-2 ml-8 space-y-1">
      {sources.map((source) => (
        <li key={`${source.date}-${source.itemId}`} className="text-sm text-mist flex items-center gap-2">
          <span className={cn(source.checked && "line-through opacity-60")}>
            {t.shopping.from_meal(source.date)}
            {source.mealDescription && ` — ${source.mealDescription}`}
          </span>
          {source.quantity != null && (
            <span className="text-xs">
              ({source.quantity}{source.unit ? ` ${unitLabel(source.unit)}` : ""})
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function ConsolidatedItemRow({
  item,
  onToggle,
}: {
  item: ConsolidatedItem;
  onToggle: (item: ConsolidatedItem) => void;
}) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const hasMultipleSources = item.sources.length > 1;

  return (
    <li className="py-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onToggle(item)}
          className="relative flex items-center justify-center w-5 h-5 shrink-0"
          aria-label={
            item.checked
              ? t.feasts.mark_unpurchased(item.canonicalName)
              : t.feasts.mark_purchased(item.canonicalName)
          }
        >
          <div
            className={cn(
              "w-5 h-5 rounded border-2 transition-colors flex items-center justify-center",
              item.checked
                ? "bg-pine border-pine"
                : item.partiallyChecked
                  ? "border-alpine bg-alpine/20"
                  : "border-mist/40",
            )}
          >
            {item.checked && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2 6 5 9 10 3" />
              </svg>
            )}
            {item.partiallyChecked && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-alpine">
                <line x1="3" y1="6" x2="9" y2="6" />
              </svg>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onToggle(item)}
          className={cn(
            "flex-1 min-w-0 text-midnight text-left cursor-pointer",
            item.checked && "line-through opacity-60",
          )}
        >
          {item.canonicalName}
        </button>

        <QuantityDisplay item={item} />

        {hasMultipleSources && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-alpine hover:text-alpine/80 shrink-0"
          >
            {expanded ? t.shopping.hide_details : t.shopping.show_details}
          </button>
        )}
      </div>

      {expanded && hasMultipleSources && <SourceDetails sources={item.sources} />}
    </li>
  );
}

function CategorySection({
  name,
  items,
  onToggle,
}: {
  name: string;
  items: ConsolidatedItem[];
  onToggle: (item: ConsolidatedItem) => void;
}) {
  return (
    <div>
      <h3 className="text-xs font-bold text-mist uppercase tracking-wider pt-4 pb-1 first:pt-0">
        {name}
      </h3>
      <ul className="divide-y divide-glass-border">
        {items.map((item) => (
          <ConsolidatedItemRow key={item.key} item={item} onToggle={onToggle} />
        ))}
      </ul>
    </div>
  );
}

function ShoppingContent() {
  const { trip, loading: tripLoading } = useTrip();
  const { meals, loading: mealsLoading } = useMeals();
  const { user } = useUser();
  const { t, locale } = useLocale();

  const {
    items,
    flatItems,
    groupingLoading,
    groupingError,
    refreshGrouping,
    toggleConsolidatedItem,
    categoryOrder,
  } = useConsolidatedShopping(meals, locale);

  const [showPurchased, setShowPurchased] = useState(false);

  const loading = tripLoading || mealsLoading;

  const handleToggle = useCallback(
    async (item: ConsolidatedItem) => {
      if (!user) return;
      trackConsolidatedToggle(!item.checked, item.sources.length);
      await toggleConsolidatedItem(item, user.name);
    },
    [user, toggleConsolidatedItem],
  );

  const handleSmartMerge = useCallback(async () => {
    trackSmartMerge(flatItems.length);
    await refreshGrouping();
  }, [flatItems.length, refreshGrouping]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">{t.shopping.title}</h1>
        <Card className="animate-pulse h-48"><span /></Card>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">{t.shopping.title}</h1>
        <Card>
          <p className="text-mist text-center py-8">{t.shopping.no_trip}</p>
        </Card>
      </div>
    );
  }

  if (flatItems.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">{t.shopping.title}</h1>
        <Card>
          <p className="text-mist text-center py-8">{t.shopping.no_items}</p>
        </Card>
      </div>
    );
  }

  const uncheckedItems = items.filter((i) => !i.checked);
  const checkedItems = items.filter((i) => i.checked);
  const totalCount = items.length;
  const checkedCount = checkedItems.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-midnight">{t.shopping.title}</h1>

      {/* Progress card */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-midnight">
              {checkedCount === totalCount
                ? t.shopping.all_done
                : t.shopping.items_remaining(totalCount - checkedCount)}
            </span>
            <span className="text-sm text-mist">
              {checkedCount}/{totalCount}
            </span>
          </div>
          <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-pine rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Smart merge button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSmartMerge}
          disabled={groupingLoading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            "bg-alpine/10 text-alpine hover:bg-alpine/20",
            groupingLoading && "opacity-60 cursor-not-allowed",
          )}
        >
          {groupingLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              {t.shopping.merging}
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3v12" />
                <path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                <path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                <path d="M15 6a9 9 0 0 0-9 9" />
              </svg>
              {t.shopping.smart_merge}
            </>
          )}
        </button>
      </div>

      {groupingError && (
        <p className="text-sm text-red-500 text-center">{t.shopping.merge_error}</p>
      )}

      {/* Unchecked items */}
      {uncheckedItems.length > 0 && (
        <Card>
          {categoryOrder ? (
            <div className="space-y-2">
              {groupByCategory(uncheckedItems, categoryOrder, t.shopping.category_other).map(([cat, catItems]) => (
                <CategorySection key={cat} name={cat} items={catItems} onToggle={handleToggle} />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-glass-border">
              {uncheckedItems.map((item) => (
                <ConsolidatedItemRow
                  key={item.key}
                  item={item}
                  onToggle={handleToggle}
                />
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Purchased section */}
      {checkedItems.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowPurchased(!showPurchased)}
            className="flex items-center gap-2 text-sm font-medium text-mist mb-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("transition-transform", showPurchased && "rotate-90")}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            {t.shopping.purchased} ({checkedItems.length})
          </button>

          {showPurchased && (
            <Card>
              {categoryOrder ? (
                <div className="space-y-2">
                  {groupByCategory(checkedItems, categoryOrder, t.shopping.category_other).map(([cat, catItems]) => (
                    <CategorySection key={cat} name={cat} items={catItems} onToggle={handleToggle} />
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-glass-border">
                  {checkedItems.map((item) => (
                    <ConsolidatedItemRow
                      key={item.key}
                      item={item}
                      onToggle={handleToggle}
                    />
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function ShoppingPage() {
  return (
    <Suspense>
      <ShoppingContent />
    </Suspense>
  );
}
