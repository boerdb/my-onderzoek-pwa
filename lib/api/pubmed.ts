import type { Article, SearchParams, SearchResult } from "@/lib/types/article";

const BASE_URL =
  process.env.PUBMED_EUTILS_BASE_URL ||
  "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const API_KEY = process.env.NCBI_API_KEY ?? "";

const STUDY_DESIGN_MAP: Record<string, string> = {
  systematic_review: "Systematic Review[Publication Type]",
  rct: "Randomized Controlled Trial[Publication Type]",
  meta_analysis: "Meta-Analysis[Publication Type]",
  cohort: "cohort study[Title/Abstract]",
  guideline: "Practice Guideline[Publication Type]",
};

function buildQuery(params: SearchParams): string {
  const parts: string[] = [params.query];

  if (params.filters.openAccessOnly) parts.push("free full text[Filter]");
  if (params.filters.studyDesign) {
    const mapped = STUDY_DESIGN_MAP[params.filters.studyDesign];
    if (mapped) parts.push(mapped);
  } else if (params.filters.reviewsOnly) {
    parts.push("Review[Publication Type]");
  }
  if (params.filters.cochraneOnly)
    parts.push(
      '"Cochrane Database of Systematic Reviews"[Journal]'
    );
  if (params.filters.language)
    parts.push(`${params.filters.language}[Language]`);

  const yr = params.filters.yearFrom;
  const yrTo = params.filters.yearTo;
  if (yr && yrTo) {
    parts.push(`${yr}:${yrTo}[PDAT]`);
  } else if (yr) {
    parts.push(`${yr}:3000[PDAT]`);
  } else if (yrTo) {
    parts.push(`1900:${yrTo}[PDAT]`);
  }

  return parts.join(" AND ");
}

async function fetchPMIDs(
  query: string,
  retmax: number,
  retstart: number
): Promise<{ pmids: string[]; total: number }> {
  const url = new URL(`${BASE_URL}/esearch.fcgi`);
  url.searchParams.set("db", "pubmed");
  url.searchParams.set("term", query);
  url.searchParams.set("retmode", "json");
  url.searchParams.set("retmax", String(retmax));
  url.searchParams.set("retstart", String(retstart));
  if (API_KEY) url.searchParams.set("api_key", API_KEY);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`PubMed eSearch error: ${res.status}`);
  const data = await res.json();

  return {
    pmids: data.esearchresult?.idlist ?? [],
    total: parseInt(data.esearchresult?.count ?? "0", 10),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSummary(summary: any): Article {
  const authors: string[] = (summary.authors ?? [])
    .slice(0, 5)
    .map((a: { name: string }) => a.name);

  const doi =
    (summary.elocationid ?? "")
      .split(", ")
      .find((e: string) => e.startsWith("doi:"))
      ?.replace("doi: ", "") ?? undefined;

  const pmid = summary.uid;
  const pmcid = undefined;

  const pubTypes: string[] = (summary.pubtype ?? []).map((t: string) =>
    t.trim()
  );

  return {
    id: `pubmed-${pmid}`,
    source: "pubmed",
    title: summary.title ?? "Untitled",
    authors,
    publicationDate: summary.pubdate ?? "",
    journal: summary.source ?? undefined,
    abstract: undefined,
    doi,
    pmid,
    pmcid,
    isOpenAccess: false,
    isReview: pubTypes.some((t) => t.toLowerCase().includes("review")),
    language: "en",
    url: doi
      ? `https://doi.org/${doi}`
      : `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    fullTextUrl: undefined,
    citationCount: undefined,
    pubTypes: pubTypes.length > 0 ? pubTypes : undefined,
  };
}

async function fetchSummaries(pmids: string[]): Promise<Article[]> {
  if (pmids.length === 0) return [];

  const url = new URL(`${BASE_URL}/esummary.fcgi`);
  url.searchParams.set("db", "pubmed");
  url.searchParams.set("id", pmids.join(","));
  url.searchParams.set("retmode", "json");
  if (API_KEY) url.searchParams.set("api_key", API_KEY);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`PubMed eSummary error: ${res.status}`);
  const data = await res.json();

  return pmids
    .map((id) => data.result?.[id])
    .filter(Boolean)
    .map(parseSummary);
}

export async function searchPubMed(
  params: SearchParams
): Promise<SearchResult> {
  const query = buildQuery(params);
  const retstart = (params.page - 1) * params.pageSize;

  const { pmids, total } = await fetchPMIDs(query, params.pageSize, retstart);
  const articles = await fetchSummaries(pmids);

  return {
    articles,
    total,
    page: params.page,
    pageSize: params.pageSize,
    source: "pubmed",
  };
}
