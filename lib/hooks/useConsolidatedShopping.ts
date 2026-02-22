"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import type { Meal, ShoppingUnit } from "@/lib/types";
import { sumQuantities, type SumOutput } from "@/lib/utils/units";
import { toggleShoppingItem } from "@/lib/actions/meals";

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
}

interface GroupingCache {
  fingerprint: string;
  groups: Map<string, string>; // itemId → canonicalName
}

// ── Helpers ─────────────────────────────────────────────────────────────

function flattenMeals(meals: Meal[]): SourceItem[] {
  const items: SourceItem[] = [];
  for (const meal of meals) {
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

function makeFingerprint(items: SourceItem[]): string {
  const texts = items.map((i) => i.text.toLowerCase().trim()).sort();
  return texts.join("|");
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

    result.push({
      key,
      canonicalName,
      sources,
      checked: allChecked,
      partiallyChecked: someChecked,
      sum,
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
    return {
      fingerprint: parsed.fingerprint,
      groups: new Map(Object.entries(parsed.groups)),
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
      }),
    );
  } catch {
    // sessionStorage may be unavailable
  }
}

// ── Hook ────────────────────────────────────────────────────────────────

export function useConsolidatedShopping(meals: Meal[]) {
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
  const fingerprint = useMemo(() => makeFingerprint(flatItems), [flatItems]);

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
    // Build reverse: group key → canonical name from the API response
    // We need to go through the AI groups to find canonical names
    const cached = aiCacheRef.current;
    if (!cached) return null;

    // The cache stores itemId → canonicalName
    // We need groupKey → canonicalName
    const nameMap = new Map<string, string>();
    for (const [, canonicalName] of cached.groups) {
      const key = canonicalName.toLowerCase().trim();
      if (!nameMap.has(key)) {
        nameMap.set(key, canonicalName);
      }
    }
    return nameMap;
  }, [currentAiMapping]);

  const items = useMemo(() => {
    if (currentAiMapping) {
      const groups = applyAIGroups(flatItems, currentAiMapping);
      return buildConsolidated(groups, aiCanonicalNames);
    }
    const groups = groupByExactMatch(flatItems);
    return buildConsolidated(groups, null);
  }, [flatItems, currentAiMapping, aiCanonicalNames]);

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
        body: JSON.stringify({ items: uniqueItems }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Request failed");
      }

      const data = await res.json();
      const groups: { canonicalName: string; itemIds: string[] }[] = data.groups;

      // Build mapping: itemId → canonicalName
      const mapping = new Map<string, string>();
      for (const group of groups) {
        for (const id of group.itemIds) {
          mapping.set(id, group.canonicalName);
        }
      }

      const cache: GroupingCache = { fingerprint, groups: mapping };
      aiCacheRef.current = cache;
      saveCachedGrouping(cache);
      setAiMapping(mapping);
    } catch (err) {
      setGroupingError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setGroupingLoading(false);
    }
  }, [flatItems, fingerprint]);

  const toggleConsolidatedItem = useCallback(
    async (item: ConsolidatedItem, updatedBy: string) => {
      // Group sources by date to avoid Firestore race conditions
      const byDate = new Map<string, SourceItem[]>();
      for (const source of item.sources) {
        const list = byDate.get(source.date);
        if (list) {
          list.push(source);
        } else {
          byDate.set(source.date, [source]);
        }
      }

      // Toggle all: if any unchecked, check all; if all checked, uncheck all
      // We toggle each individual item in Firestore
      // Parallel across dates, sequential within each date
      await Promise.all(
        Array.from(byDate.entries()).map(async ([date, sources]) => {
          for (const source of sources) {
            await toggleShoppingItem(date, source.itemId, updatedBy);
          }
        }),
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
  };
}
