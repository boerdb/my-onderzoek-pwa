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
}

export interface SearchFilters {
  yearFrom?: number;
  yearTo?: number;
  openAccessOnly: boolean;
  reviewsOnly: boolean;
  language?: string;
}

export interface SearchParams {
  query: string;
  filters: SearchFilters;
  page: number;
  pageSize: number;
}

export interface SearchResult {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
  source: "europepmc" | "pubmed" | "mixed";
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
