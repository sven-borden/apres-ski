"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import type { Meal, ShoppingUnit } from "@/lib/types";
import { sumQuantities, type SumOutput } from "@/lib/utils/units";
import { setShoppingItemsChecked } from "@/lib/actions/meals";

// ── Types ───────────────────────────────────────────────────────────────

export interface SourceItem {
  date: string;
  mealDescription: string;
  itemId: string;
  text: string;
  checked: boolean;
  quantity?: number;
  unit?: ShoppingUnit;
}

export interface ConsolidatedItem {
  key: string;
  canonicalName: string;
  sources: SourceItem[];
  checked: boolean;
  partiallyChecked: boolean;
  sum: SumOutput;
  category: string | null;
}

interface GroupingCache {
  fingerprint: string;
  groups: Map<string, string>; // itemId → canonicalName
  categories: Map<string, string>; // itemId → categoryName
  categoryOrder: string[]; // ordered category names from AI
}

// ── Helpers ─────────────────────────────────────────────────────────────

function flattenMeals(meals: Meal[]): SourceItem[] {
  const items: SourceItem[] = [];
  for (const meal of meals) {
    if (meal.excludeFromShopping) continue;
    for (const item of meal.shoppingList) {
      items.push({
        date: meal.date,
        mealDescription: meal.description,
        itemId: item.id,
        text: item.text,
        checked: item.checked,
        quantity: item.quantity,
        unit: item.unit,
      });
    }
  }
  return items;
}

function makeFingerprint(items: SourceItem[], locale: string): string {
  const texts = items.map((i) => i.text.toLowerCase().trim()).sort();
  return `${locale}|${texts.join("|")}`;
}

function groupByExactMatch(items: SourceItem[]): Map<string, SourceItem[]> {
  const groups = new Map<string, SourceItem[]>();
  for (const item of items) {
    const key = item.text.toLowerCase().trim();
    const list = groups.get(key);
    if (list) {
      list.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return groups;
}

function applyAIGroups(
  items: SourceItem[],
  aiMapping: Map<string, string>,
): Map<string, SourceItem[]> {
  const groups = new Map<string, SourceItem[]>();
  for (const item of items) {
    const canonicalName = aiMapping.get(item.itemId) ?? item.text.toLowerCase().trim();
    const key = canonicalName.toLowerCase().trim();
    const list = groups.get(key);
    if (list) {
      list.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return groups;
}

function pickCanonicalName(sources: SourceItem[], groupKey: string): string {
  // Pick the longest/most descriptive text from sources
  let best = groupKey;
  let bestLen = 0;
  for (const s of sources) {
    if (s.text.length > bestLen) {
      best = s.text;
      bestLen = s.text.length;
    }
  }
  return best;
}

function buildConsolidated(
  groups: Map<string, SourceItem[]>,
  aiCanonicalNames: Map<string, string> | null,
  aiCategories: Map<string, string> | null,
): ConsolidatedItem[] {
  const result: ConsolidatedItem[] = [];
  for (const [key, sources] of groups) {
    const checkedCount = sources.filter((s) => s.checked).length;
    const allChecked = checkedCount === sources.length;
    const someChecked = checkedCount > 0 && !allChecked;

    const canonicalName = aiCanonicalNames?.get(key) ?? pickCanonicalName(sources, key);

    const sum = sumQuantities(
      sources.map((s) => ({ quantity: s.quantity, unit: s.unit })),
    );

    // Resolve category from first source item that has one
    let category: string | null = null;
    if (aiCategories) {
      for (const s of sources) {
        const cat = aiCategories.get(s.itemId);
        if (cat) { category = cat; break; }
      }
    }

    result.push({
      key,
      canonicalName,
      sources,
      checked: allChecked,
      partiallyChecked: someChecked,
      sum,
      category,
    });
  }

  // Sort: unchecked first, then checked
  result.sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    return a.canonicalName.localeCompare(b.canonicalName);
  });

  return result;
}

const SESSION_STORAGE_KEY = "apres-ski-shopping-groups";

function loadCachedGrouping(): GroupingCache | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Backward compat: missing categories/categoryOrder = cache miss
    if (!parsed.categories || !parsed.categoryOrder) return null;
    return {
      fingerprint: parsed.fingerprint,
      groups: new Map(Object.entries(parsed.groups)),
      categories: new Map(Object.entries(parsed.categories)),
      categoryOrder: parsed.categoryOrder,
    };
  } catch {
    return null;
  }
}

function saveCachedGrouping(cache: GroupingCache) {
  try {
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        fingerprint: cache.fingerprint,
        groups: Object.fromEntries(cache.groups),
        categories: Object.fromEntries(cache.categories),
        categoryOrder: cache.categoryOrder,
      }),
    );
  } catch {
    // sessionStorage may be unavailable
  }
}

// ── Hook ────────────────────────────────────────────────────────────────

export function useConsolidatedShopping(meals: Meal[], locale: string = "fr") {
  const [groupingLoading, setGroupingLoading] = useState(false);
  const [groupingError, setGroupingError] = useState<string | null>(null);
  const aiCacheRef = useRef<GroupingCache | null>(null);
  const [aiMapping, setAiMapping] = useState<Map<string, string> | null>(() => {
    const cached = loadCachedGrouping();
    if (cached) {
      aiCacheRef.current = cached;
      return cached.groups;
    }
    return null;
  });

  const flatItems = useMemo(() => flattenMeals(meals), [meals]);
  const fingerprint = useMemo(() => makeFingerprint(flatItems, locale), [flatItems, locale]);

  // If fingerprint changed, invalidate AI cache
  const currentAiMapping = useMemo(() => {
    if (aiMapping && aiCacheRef.current?.fingerprint === fingerprint) {
      return aiMapping;
    }
    return null;
  }, [aiMapping, fingerprint]);

  // AI canonical names for display (keyed by lowercase group key)
  const aiCanonicalNames = useMemo(() => {
    if (!currentAiMapping) return null;
    const cached = aiCacheRef.current;
    if (!cached) return null;

    const nameMap = new Map<string, string>();
    for (const [, canonicalName] of cached.groups) {
      const key = canonicalName.toLowerCase().trim();
      if (!nameMap.has(key)) {
        nameMap.set(key, canonicalName);
      }
    }
    return nameMap;
  }, [currentAiMapping]);

  // AI categories mapping (itemId → categoryName)
  const aiCategories = useMemo(() => {
    if (!currentAiMapping) return null;
    const cached = aiCacheRef.current;
    if (!cached) return null;
    return cached.categories;
  }, [currentAiMapping]);

  // Ordered category names from AI
  const categoryOrder = useMemo(() => {
    if (!currentAiMapping) return null;
    const cached = aiCacheRef.current;
    if (!cached) return null;
    return cached.categoryOrder;
  }, [currentAiMapping]);

  const items = useMemo(() => {
    if (currentAiMapping) {
      const groups = applyAIGroups(flatItems, currentAiMapping);
      return buildConsolidated(groups, aiCanonicalNames, aiCategories);
    }
    const groups = groupByExactMatch(flatItems);
    return buildConsolidated(groups, null, null);
  }, [flatItems, currentAiMapping, aiCanonicalNames, aiCategories]);

  const refreshGrouping = useCallback(async () => {
    if (flatItems.length === 0) return;

    setGroupingLoading(true);
    setGroupingError(null);

    try {
      // Deduplicate texts for the API call
      const seen = new Set<string>();
      const uniqueItems: { id: string; text: string }[] = [];
      for (const item of flatItems) {
        const key = `${item.itemId}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueItems.push({ id: item.itemId, text: item.text });
        }
      }

      const token = process.env.NEXT_PUBLIC_ESTIMATE_API_TOKEN;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/group-shopping-items", {
        method: "POST",
        headers,
        body: JSON.stringify({ items: uniqueItems, locale }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Request failed");
      }

      const data = await res.json();
      const apiCategories: { categoryName: string; items: { canonicalName: string; itemIds: string[] }[] }[] = data.categories;

      // Build mappings: itemId → canonicalName and itemId → categoryName
      const groupsMapping = new Map<string, string>();
      const categoriesMapping = new Map<string, string>();
      const orderedCategories: string[] = [];

      for (const cat of apiCategories) {
        orderedCategories.push(cat.categoryName);
        for (const group of cat.items) {
          for (const id of group.itemIds) {
            groupsMapping.set(id, group.canonicalName);
            categoriesMapping.set(id, cat.categoryName);
          }
        }
      }

      const cache: GroupingCache = {
        fingerprint,
        groups: groupsMapping,
        categories: categoriesMapping,
        categoryOrder: orderedCategories,
      };
      aiCacheRef.current = cache;
      saveCachedGrouping(cache);
      setAiMapping(groupsMapping);
    } catch (err) {
      setGroupingError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setGroupingLoading(false);
    }
  }, [flatItems, fingerprint, locale]);

  const toggleConsolidatedItem = useCallback(
    async (item: ConsolidatedItem, updatedBy: string) => {
      const newChecked = !item.checked;

      // Group source item IDs by date
      const idsByDate = new Map<string, Set<string>>();
      for (const source of item.sources) {
        const ids = idsByDate.get(source.date);
        if (ids) {
          ids.add(source.itemId);
        } else {
          idsByDate.set(source.date, new Set([source.itemId]));
        }
      }

      // Single write per date (parallel across dates)
      await Promise.all(
        Array.from(idsByDate.entries()).map(([date, itemIds]) =>
          setShoppingItemsChecked(date, itemIds, newChecked, updatedBy),
        ),
      );
    },
    [],
  );

  return {
    items,
    flatItems,
    loading: false,
    groupingLoading,
    groupingError,
    refreshGrouping,
    toggleConsolidatedItem,
    categoryOrder,
  };
}

export function groupByCategory(
  items: ConsolidatedItem[],
  categoryOrder: string[],
  fallbackCategory: string,
): [string, ConsolidatedItem[]][] {
  const buckets = new Map<string, ConsolidatedItem[]>();
  // Initialize buckets in order
  for (const cat of categoryOrder) {
    buckets.set(cat, []);
  }
  // Assign items
  for (const item of items) {
    const cat = item.category ?? fallbackCategory;
    const list = buckets.get(cat);
    if (list) {
      list.push(item);
    } else {
      buckets.set(cat, [item]);
    }
  }
  // Filter out empty categories, preserve order (fallback last if not in order)
  const result: [string, ConsolidatedItem[]][] = [];
  for (const [cat, list] of buckets) {
    if (list.length > 0) result.push([cat, list]);
  }
  return result;
}
