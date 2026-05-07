export interface Article {
  id: string;
  source: "europepmc" | "pubmed";
  title: string;
  authors: string[];
  publicationDate: string;
  journal?: string;
  abstract?: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  isOpenAccess: boolean;
  isReview: boolean;
  language: string;
  url: string;
  fullTextUrl?: string;
  citationCount?: number;
  /** Normalized publication types from the source (e.g. "Randomized Controlled Trial", "Systematic Review") */
  pubTypes?: string[];
}

export type StudyDesign =
  | "systematic_review"
  | "rct"
  | "meta_analysis"
  | "cohort"
  | "guideline";

export interface SearchFilters {
  yearFrom?: number;
  yearTo?: number;
  openAccessOnly: boolean;
  reviewsOnly: boolean;
  language?: string;
  studyDesign?: StudyDesign;
  cochraneOnly?: boolean;
}

export interface SearchParams {
  query: string;
  filters: SearchFilters;
  page: number;
  pageSize: number;
  /** Europe PMC cursor token voor pagina > 1 (waarde van nextCursorMark uit vorige response) */
  cursorMark?: string;
}

export interface SearchResult {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
  source: "europepmc" | "pubmed" | "mixed";
  /** Europe PMC cursor token voor de volgende pagina */
  nextCursorMark?: string;
}

export interface AISummary {
  articleId: string;
  shortSummary: string;
  objective: string;
  methods: string;
  results: string;
  conclusion: string;
  clinicalRelevance: string;
  limitations: string;
  generatedAt: string;
  model: string;
}

export interface FavoriteArticle {
  article: Article;
  savedAt: string;
  note?: string;
}

export interface SearchHistoryEntry {
  query: string;
  filters: SearchFilters;
  timestamp: string;
  resultCount: number;
}
