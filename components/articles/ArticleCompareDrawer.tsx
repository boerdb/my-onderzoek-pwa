"use client";

import { X, ExternalLink } from "lucide-react";
import type { Article } from "@/lib/types/article";
import { removeFromCompare, clearCompare } from "@/lib/storage/compare";

interface ArticleCompareDrawerProps {
  articles: Article[];
  onClose: () => void;
  onListChange: () => void;
}

const COMPARE_FIELDS: { key: keyof Article; label: string }[] = [
  { key: "publicationDate", label: "Publicatiedatum" },
  { key: "journal", label: "Tijdschrift" },
  { key: "isOpenAccess", label: "Open access" },
  { key: "isReview", label: "Review" },
  { key: "language", label: "Taal" },
  { key: "citationCount", label: "Citaties" },
];

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "–";
  if (typeof value === "boolean") return value ? "Ja" : "Nee";
  return String(value);
}

export function ArticleCompareDrawer({
  articles,
  onClose,
  onListChange,
}: ArticleCompareDrawerProps) {
  if (articles.length < 2) return null;

  const handleRemove = (id: string) => {
    removeFromCompare(id);
    onListChange();
  };

  const handleClear = () => {
    clearCompare();
    onListChange();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Artikelen vergelijken"
      className="fixed inset-0 z-50 flex flex-col bg-white/95 backdrop-blur dark:bg-zinc-950/95"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Artikelen vergelijken ({articles.length})
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Alles wissen
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sluit vergelijking"
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-32 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400" />
              {articles.map((a) => (
                <th
                  key={a.id}
                  className="py-2 pl-4 text-left align-top"
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold leading-snug text-zinc-900 hover:text-blue-600 dark:text-zinc-50 dark:hover:text-blue-400"
                    >
                      {a.title.length > 80
                        ? a.title.slice(0, 80) + "…"
                        : a.title}
                      <ExternalLink className="ml-1 inline h-3 w-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemove(a.id)}
                      aria-label={`Verwijder ${a.title} uit vergelijking`}
                      className="shrink-0 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {a.authors.slice(0, 3).join(", ")}
                    {a.authors.length > 3 ? " e.a." : ""}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_FIELDS.map((field) => (
              <tr
                key={field.key}
                className="border-t border-zinc-100 dark:border-zinc-800"
              >
                <td className="py-3 pr-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {field.label}
                </td>
                {articles.map((a) => (
                  <td
                    key={a.id}
                    className="py-3 pl-4 text-zinc-700 dark:text-zinc-300"
                  >
                    {formatValue(a[field.key])}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-zinc-100 dark:border-zinc-800">
              <td className="py-3 pr-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Abstract
              </td>
              {articles.map((a) => (
                <td
                  key={a.id}
                  className="py-3 pl-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
                >
                  {a.abstract
                    ? a.abstract.slice(0, 250) + (a.abstract.length > 250 ? "…" : "")
                    : "–"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
