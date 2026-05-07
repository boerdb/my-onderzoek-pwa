"use client";

import { useState, useCallback } from "react";
import {
  ExternalLink,
  Heart,
  GitCompare,
  Share2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lock,
  Unlock,
} from "lucide-react";
import type { Article } from "@/lib/types/article";
import { toggleFavorite, isFavorite } from "@/lib/storage/favorites";
import { toggleCompare, isInCompare } from "@/lib/storage/compare";
import { AISummaryPanel } from "@/components/ai/AISummaryPanel";
import { useAppMode } from "@/lib/context/AppModeContext";
import { deriveEvidenceLevel } from "@/lib/ebp/evidence-levels";
import { EvidenceBadge } from "@/components/articles/EvidenceBadge";
import { CaspChecklist } from "@/components/articles/CaspChecklist";

interface ArticleCardProps {
  article: Article;
  onCompareChange?: () => void;
  onFavoriteChange?: (isFav: boolean) => void;
}

export function ArticleCard({ article, onCompareChange, onFavoriteChange }: ArticleCardProps) {
  const { mode } = useAppMode();
  const isEbp = mode === "ebp";

  const [favorited, setFavorited] = useState(() => isFavorite(article.id));
  const [inCompare, setInCompare] = useState(() => isInCompare(article.id));
  const [showAbstract, setShowAbstract] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showCasp, setShowCasp] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  const evidenceInfo = isEbp ? deriveEvidenceLevel(article) : null;

  const handleFavorite = useCallback(() => {
    const isNowFav = toggleFavorite(article);
    setFavorited(isNowFav);
    onFavoriteChange?.(isNowFav);
  }, [article, onFavoriteChange]);

  const handleCompare = useCallback(() => {
    const isNow = toggleCompare(article);
    if (!isNow && isInCompare(article.id)) {
      setInCompare(false);
    } else {
      setInCompare(isNow);
    }
    onCompareChange?.();
  }, [article, onCompareChange]);

  const handleShare = useCallback(async () => {
    const url = article.url;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.authors.join(", "),
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    }
  }, [article]);

  const plainAbstract = article.abstract
    ? article.abstract.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : article.abstract;

  const truncatedAbstract =
    plainAbstract && plainAbstract.length > 300
      ? plainAbstract.slice(0, 300) + "…"
      : plainAbstract;

  return (
    <article className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <header className="mb-3">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {article.isOpenAccess ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Unlock className="h-3 w-3" />
              Open Access
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Lock className="h-3 w-3" />
              Beperkte toegang
            </span>
          )}
          {article.isReview && !isEbp && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-400">
              <BookOpen className="h-3 w-3" />
              Review
            </span>
          )}
          {isEbp && evidenceInfo && <EvidenceBadge info={evidenceInfo} />}
          <span className="text-xs text-zinc-400">
            {article.source === "europepmc" ? "Europe PMC" : "PubMed"}
          </span>
        </div>

        <h2 className="text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            {article.title}
          </a>
        </h2>
      </header>

      <div className="mb-3 space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
        {article.authors.length > 0 && (
          <p>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Auteurs:
            </span>{" "}
            {article.authors.join(", ")}
            {article.authors.length >= 5 ? " e.a." : ""}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
          {article.publicationDate && (
            <span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Datum:
              </span>{" "}
              {article.publicationDate}
            </span>
          )}
          {article.journal && (
            <span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Tijdschrift:
              </span>{" "}
              <em>{article.journal}</em>
            </span>
          )}
          {article.doi && (
            <span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                DOI:
              </span>{" "}
              <a
                href={`https://doi.org/${article.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {article.doi}
              </a>
            </span>
          )}
        </div>
      </div>

      {plainAbstract && (
        <div className="mb-3">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {showAbstract ? plainAbstract : truncatedAbstract}
          </p>
          {plainAbstract.length > 300 && (
            <button
              type="button"
              onClick={() => setShowAbstract((s) => !s)}
              className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {showAbstract ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Minder tonen
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Volledig abstract
                </>
              )}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Bekijk artikel
        </a>

        <button
          type="button"
          onClick={() => setShowSummary((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          disabled={!article.abstract}
          title={!article.abstract ? "Geen abstract beschikbaar" : undefined}
        >
          {showSummary ? "Verberg uittreksel" : "AI-uittreksel"}
        </button>

        <button
          type="button"
          onClick={handleFavorite}
          aria-label={favorited ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
          aria-pressed={favorited}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
            favorited
              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${favorited ? "fill-current" : ""}`} />
          {favorited ? "Favoriet" : "Bewaar"}
        </button>

        <button
          type="button"
          onClick={handleCompare}
          aria-label={inCompare ? "Verwijder uit vergelijking" : "Voeg toe aan vergelijking"}
          aria-pressed={inCompare}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
            inCompare
              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          <GitCompare className="h-3.5 w-3.5" />
          {inCompare ? "Vergelijken" : "Vergelijk"}
        </button>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Deel artikel"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <Share2 className="h-3.5 w-3.5" />
          {shareStatus === "copied" ? "Gekopieerd!" : "Deel"}
        </button>

        {isEbp && (
          <button
            type="button"
            onClick={() => setShowCasp((s) => !s)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              showCasp
                ? "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-400"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            CASP
          </button>
        )}
      </div>

      {showSummary && article.abstract && (
        <div className="mt-4">
          <AISummaryPanel article={article} />
        </div>
      )}

      {isEbp && showCasp && (
        <CaspChecklist article={article} />
      )}
    </article>
  );
}
