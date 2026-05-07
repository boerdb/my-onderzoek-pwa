"use client";

import { useState, useEffect } from "react";
import { ClipboardList, ChevronDown, ChevronUp, RotateCcw, HelpCircle } from "lucide-react";
import type { Article } from "@/lib/types/article";
import type { CaspAnswer } from "@/lib/ebp/casp-checklists";
import { getCaspChecklist } from "@/lib/ebp/casp-checklists";
import {
  getCaspAnswers,
  setCaspAnswer,
  clearCaspAnswers,
  getCaspProgress,
} from "@/lib/storage/casp";

const ANSWER_OPTIONS: { value: CaspAnswer; label: string; color: string }[] = [
  {
    value: "ja",
    label: "Ja",
    color:
      "border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-green-950/50 dark:text-green-400",
  },
  {
    value: "nee",
    label: "Nee",
    color:
      "border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-950/50 dark:text-red-400",
  },
  {
    value: "onduidelijk",
    label: "Onduidelijk",
    color:
      "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  },
];

interface CaspChecklistProps {
  article: Article;
}

export function CaspChecklist({ article }: CaspChecklistProps) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, CaspAnswer>>({});
  const [hintOpen, setHintOpen] = useState<string | null>(null);
  const checklist = getCaspChecklist(article);

  useEffect(() => {
    setAnswers(getCaspAnswers(article.id));
  }, [article.id]);

  const handleAnswer = (questionId: string, answer: CaspAnswer) => {
    const next = answers[questionId] === answer ? null : answer;
    setCaspAnswer(article.id, questionId, next);
    setAnswers((prev) => ({ ...prev, [questionId]: next }));
  };

  const handleClear = () => {
    clearCaspAnswers(article.id);
    setAnswers({});
  };

  const progress = getCaspProgress(article.id, checklist.questions.length);
  const total = checklist.questions.length;

  return (
    <div className="mt-3 rounded-xl border border-teal-200 dark:border-teal-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left transition-colors hover:bg-teal-50 dark:hover:bg-teal-950/30"
      >
        <ClipboardList className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">
            CASP-beoordeling
          </span>
          <span className="ml-2 text-xs text-zinc-400">
            {checklist.label}
          </span>
        </div>
        {progress.answered > 0 && (
          <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
            {progress.answered}/{total} beantwoord
            {progress.yes > 0 && (
              <span className="ml-1 text-green-600 dark:text-green-400">
                · {progress.yes} ja
              </span>
            )}
          </span>
        )}
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-teal-100 px-4 pb-4 pt-3 dark:border-teal-900">
          {progress.answered > 0 && (
            <div className="mb-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-teal-500 transition-all"
                  style={{ width: `${(progress.answered / total) * 100}%` }}
                />
              </div>
              <span className="shrink-0 text-xs text-zinc-400">
                {Math.round((progress.answered / total) * 100)}%
              </span>
            </div>
          )}

          <ol className="space-y-4">
            {checklist.questions.map((q, i) => {
              const current = answers[q.id] ?? null;
              return (
                <li key={q.id}>
                  <div className="mb-1.5 flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-400">
                      {i + 1}
                    </span>
                    <p className="flex-1 text-sm text-zinc-800 dark:text-zinc-200">
                      {q.text}
                    </p>
                    {q.hint && (
                      <button
                        type="button"
                        aria-label="Toon toelichting"
                        onClick={() =>
                          setHintOpen(hintOpen === q.id ? null : q.id)
                        }
                        className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {hintOpen === q.id && q.hint && (
                    <p className="mb-1.5 ml-7 rounded-lg bg-zinc-100 px-2 py-1.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {q.hint}
                    </p>
                  )}
                  <div className="ml-7 flex gap-1.5">
                    {ANSWER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleAnswer(q.id, opt.value)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                          current === opt.value
                            ? `${opt.color} ring-2 ring-offset-1`
                            : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>

          {progress.answered > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <div className="flex gap-3 text-xs text-zinc-500">
                <span className="text-green-600 dark:text-green-400">
                  {progress.yes} ja
                </span>
                <span className="text-red-600 dark:text-red-400">
                  {progress.no} nee
                </span>
                <span className="text-amber-600 dark:text-amber-400">
                  {progress.unclear} onduidelijk
                </span>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <RotateCcw className="h-3 w-3" />
                Wis antwoorden
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
