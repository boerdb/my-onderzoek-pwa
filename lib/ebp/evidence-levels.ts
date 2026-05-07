import type { Article } from "@/lib/types/article";

export type EvidenceLevel = 1 | 2 | 3 | 4 | 5;

export interface LevelInfo {
  level: EvidenceLevel;
  label: string;
  description: string;
  color: "green" | "teal" | "blue" | "amber" | "zinc";
}

export const LEVEL_INFO: Record<EvidenceLevel, LevelInfo> = {
  1: {
    level: 1,
    label: "Niveau 1",
    description: "Systematische review / Meta-analyse",
    color: "green",
  },
  2: {
    level: 2,
    label: "Niveau 2",
    description: "Randomized Controlled Trial (RCT)",
    color: "teal",
  },
  3: {
    level: 3,
    label: "Niveau 3",
    description: "Cohortonderzoek / Gecontroleerde studie",
    color: "blue",
  },
  4: {
    level: 4,
    label: "Niveau 4",
    description: "Case-control / Case series / Cross-sectioneel",
    color: "amber",
  },
  5: {
    level: 5,
    label: "Niveau 5",
    description: "Expert opinion / Narratieve review / Richtlijn",
    color: "zinc",
  },
};

const LEVEL1_TYPES = [
  "systematic review",
  "meta-analysis",
  "meta analysis",
  "cochrane review",
];
const LEVEL2_TYPES = [
  "randomized controlled trial",
  "randomised controlled trial",
  "controlled clinical trial",
  "rct",
];
const LEVEL3_TYPES = [
  "cohort",
  "controlled before-after",
  "quasi-experimental",
  "comparative study",
  "clinical trial",
];
const LEVEL4_TYPES = [
  "case-control",
  "case control",
  "case series",
  "cross-sectional",
  "observational",
];
const LEVEL5_TYPES = [
  "review",
  "practice guideline",
  "guideline",
  "editorial",
  "expert opinion",
  "narrative",
  "comment",
  "letter",
];

function matchesAny(text: string, patterns: string[]): boolean {
  const lower = text.toLowerCase();
  return patterns.some((p) => lower.includes(p));
}

export function deriveEvidenceLevel(article: Article): LevelInfo {
  const types = article.pubTypes ?? [];
  const title = article.title ?? "";
  const journal = article.journal ?? "";

  const allText = [...types, title, journal].join(" ").toLowerCase();

  if (matchesAny(allText, LEVEL1_TYPES)) return LEVEL_INFO[1];
  if (matchesAny(allText, LEVEL2_TYPES)) return LEVEL_INFO[2];
  if (matchesAny(allText, LEVEL3_TYPES)) return LEVEL_INFO[3];
  if (matchesAny(allText, LEVEL4_TYPES)) return LEVEL_INFO[4];
  if (article.isReview) return LEVEL_INFO[1];
  if (matchesAny(allText, LEVEL5_TYPES)) return LEVEL_INFO[5];

  return LEVEL_INFO[5];
}
