"use client";

import type { SearchHistoryEntry, SearchFilters } from "@/lib/types/article";

const HISTORY_KEY = "medsummary:search-history";
const MAX_HISTORY = 20;

export function getSearchHistory(): SearchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SearchHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addSearchHistory(
  query: string,
  filters: SearchFilters,
  resultCount: number
): void {
  if (typeof window === "undefined") return;
  const history = getSearchHistory();

  const updated = [
    { query, filters, timestamp: new Date().toISOString(), resultCount },
    ...history.filter((h) => h.query !== query),
  ].slice(0, MAX_HISTORY);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}
