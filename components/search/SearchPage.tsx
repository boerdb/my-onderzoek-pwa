"use client";

import { useState, useCallback, useEffect, startTransition } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterPanel } from "@/components/search/FilterPanel";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleCardSkeleton } from "@/components/articles/ArticleCardSkeleton";
import { ArticleCompareDrawer } from "@/components/articles/ArticleCompareDrawer";
import type { SearchFilters, SearchResult, Article } from "@/lib/types/article";
import { addSearchHistory } from "@/lib/storage/history";
import { getCompareList } from "@/lib/storage/compare";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  WifiOff,
  GitCompare,
  Search,
} from "lucide-react";

const DEFAULT_FILTERS: SearchFilters = {
  openAccessOnly: false,
  reviewsOnly: false,
};

async function fetchSearch(
  query: string,
  filters: SearchFilters,
  page: number,
  cursorMark?: string
): Promise<SearchResult> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    pageSize: "10",
    openAccessOnly: String(filters.openAccessOnly),
    reviewsOnly: String(filters.reviewsOnly),
  });
  if (filters.yearFrom) params.set("yearFrom", String(filters.yearFrom));
  if (filters.yearTo) params.set("yearTo", String(filters.yearTo));
  if (filters.language) params.set("language", filters.language);
  if (cursorMark) params.set("cursorMark", cursorMark);

  const res = await fetch(`/api/search?${params}`);
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? `Zoekfout ${res.status}`);
  }
  return res.json() as Promise<SearchResult>;
}

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [compareArticles, setCompareArticles] = useState<Article[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  /**
   * Cursor tokens voor Europe PMC cursor-gebaseerde paginering.
   * cursorMarks[n] = het token dat nodig is om pagina n op te halen.
   */
  const [cursorMarks, setCursorMarks] = useState<Record<number, string>>({});
  /** True zodra een zoekopdracht via PubMed (fallback) resultaten geeft; PubMed gebruikt gewone offset-paginering. */
  const [usesPubMed, setUsesPubMed] = useState(false);

  useEffect(() => {
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    startTransition(() => setIsOffline(!navigator.onLine));
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const refreshCompare = useCallback(() => {
    setCompareArticles(getCompareList());
  }, []);

  // Cursor mark voor de huidige pagina (alleen voor Europe PMC, pagina > 1)
  const cursorMark = page === 1 ? undefined : cursorMarks[page];
  const needsCursor = page > 1 && !usesPubMed;

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["search", submittedQuery, filters, page, cursorMark ?? null],
    queryFn: () => fetchSearch(submittedQuery, filters, page, cursorMark),
    enabled: submittedQuery.length > 0 && (!needsCursor || cursorMark !== undefined),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (data && submittedQuery) {
      addSearchHistory(submittedQuery, filters, data.total);
    }
  }, [data, submittedQuery, filters]);

  // Sla de nextCursorMark op voor de volgende pagina (Europe PMC cursor-paginering)
  useEffect(() => {
    if (!data) return;
    if (data.source === "pubmed") {
      setUsesPubMed(true);
    }
    if (data.nextCursorMark) {
      setCursorMarks((prev) => {
        const next = page + 1;
        if (prev[next] === data.nextCursorMark) return prev;
        return { ...prev, [next]: data.nextCursorMark! };
      });
    }
  }, [data, page]);

  useEffect(() => {
    if (!submittedQuery || page === 1) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, submittedQuery]);

  const handleSearch = useCallback((q: string) => {
    setSubmittedQuery(q);
    setQuery(q);
    setPage(1);
    setCursorMarks({});
    setUsesPubMed(false);
  }, []);

  const handleFilterChange = useCallback((f: SearchFilters) => {
    setFilters(f);
    setPage(1);
    setCursorMarks({});
    setUsesPubMed(false);
  }, []);

  const totalPages = data ? Math.ceil(data.total / 10) : 0;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      {isOffline && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          Geen internetverbinding. Eerder geladen resultaten kunnen worden getoond.
        </div>
      )}

      <div className="mb-6 flex flex-col items-center gap-2 text-center sm:mb-8 sm:gap-3">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl md:text-4xl">
          Zoek medische artikelen
        </h1>
        <p className="max-w-xl text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          Doorzoek miljoenen artikelen via Europe PMC en PubMed. Genereer
          AI-uittreksels met Gemini.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <SearchBar
          initialQuery={query}
          onSearch={handleSearch}
          isLoading={isLoading || isFetching}
        />
        <FilterPanel filters={filters} onChange={handleFilterChange} />
      </div>

      {compareArticles.length >= 2 && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              refreshCompare();
              setShowCompare(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-950"
          >
            <GitCompare className="h-4 w-4" />
            {compareArticles.length} artikelen vergelijken
          </button>
        </div>
      )}

      {!submittedQuery && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-zinc-400">
          <Search className="h-12 w-12 opacity-30" aria-hidden="true" />
          <p className="text-lg font-medium">Begin met zoeken</p>
          <p className="text-sm">
            Voer een zoekterm in, zoals een aandoening, behandeling of
            medicijn.
          </p>
        </div>
      )}

      {submittedQuery && isError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Zoekfout</p>
            <p>{(error as Error).message}</p>
          </div>
        </div>
      )}

      {(isLoading || isFetching) && submittedQuery && (
        <div className="space-y-4" aria-label="Artikelen laden…" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      )}

      {data && !isLoading && submittedQuery && (
        <>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            {data.total.toLocaleString("nl-NL")} resultaten voor{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">
              &ldquo;{submittedQuery}&rdquo;
            </strong>
            {data.source === "pubmed" && (
              <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                via PubMed (fallback)
              </span>
            )}
          </p>

          {data.articles.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <p className="text-lg font-medium">Geen resultaten gevonden</p>
              <p className="mt-1 text-sm">
                Probeer andere zoektermen of verruim de filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onCompareChange={refreshCompare}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              aria-label="Paginering"
              className="mt-8 flex items-center justify-center gap-2"
            >
              <button
                type="button"
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <ChevronLeft className="h-4 w-4" />
                Vorige
              </button>
              <span className="text-sm text-zinc-500">
                Pagina {page} van {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Volgende
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </>
      )}

      {showCompare && compareArticles.length >= 2 && (
        <ArticleCompareDrawer
          articles={compareArticles}
          onClose={() => setShowCompare(false)}
          onListChange={refreshCompare}
        />
      )}
    </main>
  );
}
