"use client";

import type { CaspAnswer } from "@/lib/ebp/casp-checklists";

const CASP_KEY = "medsummary:casp";

type CaspAnswers = Record<string, CaspAnswer>;
type CaspStore = Record<string, CaspAnswers>;

function getStore(): CaspStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CASP_KEY);
    return raw ? (JSON.parse(raw) as CaspStore) : {};
  } catch {
    return {};
  }
}

function saveStore(store: CaspStore): void {
  localStorage.setItem(CASP_KEY, JSON.stringify(store));
}

export function getCaspAnswers(articleId: string): CaspAnswers {
  return getStore()[articleId] ?? {};
}

export function setCaspAnswer(
  articleId: string,
  questionId: string,
  answer: CaspAnswer
): void {
  if (typeof window === "undefined") return;
  const store = getStore();
  store[articleId] = { ...(store[articleId] ?? {}), [questionId]: answer };
  saveStore(store);
}

export function clearCaspAnswers(articleId: string): void {
  if (typeof window === "undefined") return;
  const store = getStore();
  delete store[articleId];
  saveStore(store);
}

export function getCaspProgress(
  articleId: string,
  total: number
): { answered: number; yes: number; no: number; unclear: number } {
  const answers = getCaspAnswers(articleId);
  const values = Object.values(answers).filter((v) => v !== null);
  return {
    answered: values.length,
    yes: values.filter((v) => v === "ja").length,
    no: values.filter((v) => v === "nee").length,
    unclear: values.filter((v) => v === "onduidelijk").length,
  };
}
