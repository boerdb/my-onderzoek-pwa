"use client";

import type { Article, FavoriteArticle } from "@/lib/types/article";

const FAVORITES_KEY = "medsummary:favorites";

export function getFavorites(): FavoriteArticle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as FavoriteArticle[]) : [];
  } catch {
    return [];
  }
}

export function isFavorite(articleId: string): boolean {
  return getFavorites().some((f) => f.article.id === articleId);
}

export function addFavorite(article: Article): void {
  if (typeof window === "undefined") return;
  const favorites = getFavorites();
  if (favorites.some((f) => f.article.id === article.id)) return;
  const updated = [
    { article, savedAt: new Date().toISOString() },
    ...favorites,
  ];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
}

export function removeFavorite(articleId: string): void {
  if (typeof window === "undefined") return;
  const updated = getFavorites().filter((f) => f.article.id !== articleId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
}

export function updateFavoriteNote(articleId: string, note: string): void {
  if (typeof window === "undefined") return;
  const updated = getFavorites().map((f) =>
    f.article.id === articleId ? { ...f, note: note || undefined } : f
  );
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
}

export function toggleFavorite(article: Article): boolean {
  if (isFavorite(article.id)) {
    removeFavorite(article.id);
    return false;
  } else {
    addFavorite(article);
    return true;
  }
}
