"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";
import type { Article, AISummary } from "@/lib/types/article";

interface AISummaryPanelProps {
  article: Article;
}

const SECTIONS: { key: keyof AISummary; label: string }[] = [
  { key: "shortSummary", label: "Korte samenvatting" },
  { key: "objective", label: "Doel van de studie" },
  { key: "methods", label: "Methoden" },
  { key: "results", label: "Belangrijkste resultaten" },
  { key: "conclusion", label: "Conclusie" },
  { key: "clinicalRelevance", label: "Klinische relevantie" },
  { key: "limitations", label: "Beperkingen" },
];

export function AISummaryPanel({ article }: AISummaryPanelProps) {
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!article.abstract) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.id,
          title: article.title,
          abstract: article.abstract,
          pmcid: article.pmcid,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? `Fout ${res.status}`);
      }

      const data = (await res.json()) as AISummary;
      setSummary(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Onbekende fout bij genereren van samenvatting."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!article.abstract) {
    return (
      <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-800">
        Geen abstract beschikbaar voor dit artikel.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
          AI-uittreksel (Gemini)
        </h3>
      </div>

      {!summary && !isLoading && !error && (
        <button
          type="button"
          onClick={generate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Sparkles className="h-4 w-4" />
          Genereer AI-uittreksel
        </button>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          Samenvatting wordt gegenereerd…
        </div>
      )}

      {error && (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={generate}
            className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            <RefreshCw className="h-3 w-3" />
            Opnieuw proberen
          </button>
        </div>
      )}

      {summary && (
        <div className="space-y-3">
          {SECTIONS.map(({ key, label }) => {
            const value = summary[key];
            if (!value || typeof value !== "string" || value.trim() === "")
              return null;
            return (
              <section key={key}>
                <h4 className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                  {label}
                </h4>
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {value}
                </p>
              </section>
            );
          })}

          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              <strong>Disclaimer:</strong> Dit is een AI-gegenereerde samenvatting op
              basis van het abstract{summary && article.pmcid ? " en de volledige tekst" : ""}. Dit is{" "}
              <strong>geen medisch advies</strong>. Lees altijd het{" "}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                originele artikel
              </a>{" "}
              voor volledige en nauwkeurige informatie. Raadpleeg een medisch professional
              voor persoonlijk medisch advies.
            </p>
          </div>

          <button
            type="button"
            onClick={generate}
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <RefreshCw className="h-3 w-3" />
            Opnieuw genereren
          </button>
        </div>
      )}
    </div>
  );
}
