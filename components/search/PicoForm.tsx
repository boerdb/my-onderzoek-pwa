"use client";

import { useState, type FormEvent } from "react";
import { Search, RotateCcw, HelpCircle, Languages, AlertTriangle } from "lucide-react";

interface PicoFormProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

interface PicoFields {
  patient: string;
  intervention: string;
  comparison: string;
  outcome: string;
  timeframe: string;
}

const EMPTY_FIELDS: PicoFields = {
  patient: "",
  intervention: "",
  comparison: "",
  outcome: "",
  timeframe: "",
};

const PICO_FIELDS: {
  key: keyof PicoFields;
  label: string;
  letter: string;
  placeholder: string;
  required: boolean;
  hint: string;
}[] = [
  {
    key: "patient",
    letter: "P",
    label: "Patient / Populatie",
    placeholder: "bijv. elderly patients with dementia",
    required: true,
    hint: "Wie zijn de patiënten of de doelgroep? Gebruik Engelse termen voor de beste resultaten.",
  },
  {
    key: "intervention",
    letter: "I",
    label: "Interventie",
    placeholder: "bijv. music therapy",
    required: true,
    hint: "Welke behandeling of interventie? Gebruik Engelse termen voor de beste resultaten.",
  },
  {
    key: "comparison",
    letter: "C",
    label: "Vergelijking",
    placeholder: "bijv. standard care (optioneel)",
    required: false,
    hint: "Waarmee wordt de interventie vergeleken?",
  },
  {
    key: "outcome",
    letter: "O",
    label: "Outcome",
    placeholder: "bijv. anxiety reduction",
    required: true,
    hint: "Welk resultaat of uitkomst meet je? Gebruik Engelse termen voor de beste resultaten.",
  },
  {
    key: "timeframe",
    letter: "T",
    label: "Tijdsbestek",
    placeholder: "bijv. 6 months (optioneel)",
    required: false,
    hint: "Binnen welke tijdspanne?",
  },
];

function buildPicoQuery(fields: PicoFields): string {
  const parts: string[] = [];
  if (fields.patient.trim()) parts.push(`(${fields.patient.trim()})`);
  if (fields.intervention.trim()) parts.push(`(${fields.intervention.trim()})`);
  if (fields.comparison.trim()) parts.push(`(${fields.comparison.trim()})`);
  if (fields.outcome.trim()) parts.push(`(${fields.outcome.trim()})`);
  if (fields.timeframe.trim()) parts.push(`(${fields.timeframe.trim()})`);
  return parts.join(" AND ");
}

function looksNonEnglish(fields: PicoFields): boolean {
  const text = [fields.patient, fields.intervention, fields.outcome].join(" ").toLowerCase();
  const dutchWords = [
    "oudere", "patiënten", "mensen", "therapie", "behandeling",
    "vermindering", "verbetering", "zorg", "angst", "pijn", "effecten",
    "kinderen", "volwassenen", "ouderen", "chronisch",
  ];
  return dutchWords.some((w) => text.includes(w));
}

export function PicoForm({ onSearch, isLoading = false }: PicoFormProps) {
  const [fields, setFields] = useState<PicoFields>(EMPTY_FIELDS);
  const [activeHint, setActiveHint] = useState<keyof PicoFields | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const update = (key: keyof PicoFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setTranslateError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = buildPicoQuery(fields);
    if (query.trim()) onSearch(query);
  };

  const handleReset = () => {
    setFields(EMPTY_FIELDS);
    setTranslateError(null);
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    setTranslateError(null);
    try {
      const res = await fetch("/api/translate-pico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Vertaling mislukt");
      }
      const translated = (await res.json()) as PicoFields;
      setFields(translated);
    } catch (err) {
      setTranslateError(err instanceof Error ? err.message : "Vertaling mislukt");
    } finally {
      setIsTranslating(false);
    }
  };

  const isValid =
    fields.patient.trim() &&
    fields.intervention.trim() &&
    fields.outcome.trim();

  const hasContent =
    fields.patient.trim() ||
    fields.intervention.trim() ||
    fields.outcome.trim();

  const showTranslateHint = hasContent && looksNonEnglish(fields);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900 dark:bg-teal-950/30">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">
            PICO-zoekhulp
          </span>
          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-medium text-teal-600 dark:bg-teal-900 dark:text-teal-300">
            EBP
          </span>
          <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
            Tip: gebruik Engelse zoektermen
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PICO_FIELDS.map(({ key, letter, label, placeholder, required, hint }) => (
            <div key={key} className={key === "timeframe" ? "sm:col-span-2 lg:col-span-1" : ""}>
              <label
                htmlFor={`pico-${key}`}
                className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white dark:bg-teal-500">
                  {letter}
                </span>
                {label}
                {!required && (
                  <span className="font-normal text-zinc-400">(optioneel)</span>
                )}
                <button
                  type="button"
                  aria-label={`Uitleg ${label}`}
                  onClick={() => setActiveHint(activeHint === key ? null : key)}
                  className="ml-auto text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </label>
              {activeHint === key && (
                <p className="mb-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {hint}
                </p>
              )}
              <input
                id={`pico-${key}`}
                type="text"
                value={fields[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>
          ))}
        </div>

        {showTranslateHint && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/40">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="flex-1 text-xs text-amber-800 dark:text-amber-300">
              Het lijkt erop dat je Nederlandse termen gebruikt. Europe PMC en PubMed zijn Engelstalig — vertaal de velden voor betere resultaten.
            </p>
            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating}
              className="shrink-0 inline-flex items-center gap-1 rounded-md bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60 dark:bg-amber-500 dark:hover:bg-amber-600"
            >
              <Languages className="h-3 w-3" />
              {isTranslating ? "Vertalen…" : "Vertaal naar Engels"}
            </button>
          </div>
        )}

        {translateError && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            {translateError}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-600"
          >
            <Search className="h-4 w-4" />
            {isLoading ? "Zoeken…" : "Zoeken"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Wissen
          </button>
          {hasContent && !showTranslateHint && (
            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <Languages className="h-3.5 w-3.5" />
              {isTranslating ? "Vertalen…" : "Vertaal"}
            </button>
          )}
        </div>

        {isValid && (
          <p className="mt-3 break-all rounded-lg bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">
              Query:{" "}
            </span>
            {buildPicoQuery(fields)}
          </p>
        )}
      </div>
    </form>
  );
}
