"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getFavorites, removeFavorite } from "@/lib/storage/favorites";
import type { FavoriteArticle } from "@/lib/types/article";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleCardSkeleton } from "@/components/articles/ArticleCardSkeleton";

export default function FavorietenPage() {
  const [favorites, setFavorites] = useState<FavoriteArticle[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
    setLoaded(true);
  }, []);

  const handleRemove = useCallback((articleId: string) => {
    removeFavorite(articleId);
    setFavorites(getFavorites());
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug
        </Link>

        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-red-500 text-red-500" aria-hidden="true" />
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Favorieten
          </h1>
          {loaded && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {favorites.length}
            </span>
          )}
        </div>
      </div>

      {!loaded ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <Heart className="mb-4 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
          <p className="text-base font-medium text-zinc-500 dark:text-zinc-400">
            Nog geen favorieten opgeslagen
          </p>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
            Klik op &ldquo;Bewaar&rdquo; bij een artikel om het hier te bewaren.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Ga naar zoeken
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Meest recent opgeslagen bovenaan
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm("Alle favorieten verwijderen?")) {
                  favorites.forEach((f) => removeFavorite(f.article.id));
                  setFavorites([]);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Alles wissen
            </button>
          </div>

          <div className="space-y-4">
            {favorites.map(({ article, savedAt }) => (
              <div key={article.id} className="relative">
                <ArticleCard
                  article={article}
                  onFavoriteChange={(isFav) => {
                    if (!isFav) handleRemove(article.id);
                  }}
                />
                <p className="mt-1 text-right text-xs text-zinc-400 dark:text-zinc-600">
                  Opgeslagen op{" "}
                  {new Date(savedAt).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
