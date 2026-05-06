"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import type { SearchFilters } from "@/lib/types/article";

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

const LANGUAGES = [
  { value: "", label: "Alle talen" },
  { value: "eng", label: "Engels" },
  { value: "fre", label: "Frans" },
  { value: "ger", label: "Duits" },
  { value: "spa", label: "Spaans" },
  { value: "por", label: "Portugees" },
  { value: "dut", label: "Nederlands" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1990 + 1 }, (_, i) =>
  String(currentYear - i)
);

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const update = (partial: Partial<SearchFilters>) =>
    onChange({ ...filters, ...partial });

  const activeCount = [
    filters.openAccessOnly,
    filters.reviewsOnly,
    filters.language,
    filters.yearFrom,
    filters.yearTo,
  ].filter(Boolean).length;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-700 dark:bg-zinc-900">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Publicatietypes
            </span>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={filters.openAccessOnly}
                onChange={(e) => update({ openAccessOnly: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              Alleen open access
            </label>
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={filters.reviewsOnly}
                onChange={(e) => update({ reviewsOnly: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              Alleen reviews
            </label>
          </div>

          <div>
            <label
              htmlFor="filter-lang"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
            >
              Taal
            </label>
            <select
              id="filter-lang"
              value={filters.language ?? ""}
              onChange={(e) =>
                update({ language: e.target.value || undefined })
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-year-from"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
            >
              Jaar van
            </label>
            <select
              id="filter-year-from"
              value={filters.yearFrom ?? ""}
              onChange={(e) =>
                update({
                  yearFrom: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="">Alles</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-year-to"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
            >
              Jaar tot
            </label>
            <select
              id="filter-year-to"
              value={filters.yearTo ?? ""}
              onChange={(e) =>
                update({
                  yearTo: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="">Alles</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="button"
              onClick={() =>
                onChange({
                  openAccessOnly: false,
                  reviewsOnly: false,
                  language: undefined,
                  yearFrom: undefined,
                  yearTo: undefined,
                })
              }
              className="text-xs text-zinc-400 underline-offset-2 hover:text-zinc-700 hover:underline dark:hover:text-zinc-200"
            >
              Filters wissen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
