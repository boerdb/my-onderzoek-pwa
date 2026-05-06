"use client";

import type { Article } from "@/lib/types/article";

const COMPARE_KEY = "medsummary:compare";
const MAX_COMPARE = 4;

export function getCompareList(): Article[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    return raw ? (JSON.parse(raw) as Article[]) : [];
  } catch {
    return [];
  }
}

export function isInCompare(articleId: string): boolean {
  return getCompareList().some((a) => a.id === articleId);
}

export function addToCompare(article: Article): boolean {
  if (typeof window === "undefined") return false;
  const list = getCompareList();
  if (list.some((a) => a.id === article.id)) return false;
  if (list.length >= MAX_COMPARE) return false;
  const updated = [...list, article];
  localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
  return true;
}

export function removeFromCompare(articleId: string): void {
  if (typeof window === "undefined") return;
  const updated = getCompareList().filter((a) => a.id !== articleId);
  localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
}

export function clearCompare(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COMPARE_KEY);
}

export function toggleCompare(article: Article): boolean {
  if (isInCompare(article.id)) {
    removeFromCompare(article.id);
    return false;
  }
  return addToCompare(article);
}
