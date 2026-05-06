import type { Article, SearchParams, SearchResult } from "@/lib/types/article";

const BASE_URL =
  process.env.EUROPE_PMC_BASE_URL ||
  "https://www.ebi.ac.uk/europepmc/webservices/rest";

function buildQuery(params: SearchParams): string {
  const parts: string[] = [params.query];

  if (params.filters.openAccessOnly) parts.push("OPEN_ACCESS:y");
  if (params.filters.reviewsOnly) parts.push("PUB_TYPE:Review");
  if (params.filters.language) parts.push(`LANG:${params.filters.language}`);
  if (params.filters.yearFrom)
    parts.push(`FIRST_PDATE:[${params.filters.yearFrom}-01-01 TO *]`);
  if (params.filters.yearTo)
    parts.push(`FIRST_PDATE:[* TO ${params.filters.yearTo}-12-31]`);

  return parts.join(" AND ");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseArticle(item: any): Article {
  const authors: string[] = [];
  if (item.authorString) {
    authors.push(...item.authorString.split(", ").slice(0, 5));
  }

  const pmcid = item.pmcid ?? undefined;
  const doi = item.doi ?? undefined;

  return {
    id: item.id ?? `epmc-${item.pmid ?? Math.random()}`,
    source: "europepmc",
    title: item.title?.replace(/<[^>]+>/g, "") ?? "Untitled",
    authors,
    publicationDate: item.firstPublicationDate ?? item.pubYear ?? "",
    journal: item.journalTitle ?? undefined,
    abstract: item.abstractText ?? undefined,
    doi,
    pmid: item.pmid ?? undefined,
    pmcid,
    isOpenAccess: item.isOpenAccess === "Y",
    isReview: (item.pubTypeList?.pubType ?? []).includes("Review"),
    language: item.language ?? "en",
    url: doi
      ? `https://doi.org/${doi}`
      : `https://europepmc.org/article/${item.source ?? "MED"}/${item.pmid ?? item.id}`,
    fullTextUrl: pmcid
      ? `https://europepmc.org/articles/${pmcid}`
      : undefined,
    citationCount: item.citedByCount ?? undefined,
  };
}

export async function searchEuropePMC(
  params: SearchParams
): Promise<SearchResult> {
  const query = buildQuery(params);

  // Europe PMC uses cursor-based pagination. Page 1 always uses "*".
  // For page > 1 the caller must supply the nextCursorMark from the previous response.
  const cursorMark = params.cursorMark ?? "*";

  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("pageSize", String(params.pageSize));
  url.searchParams.set("cursorMark", cursorMark);
  url.searchParams.set("resultType", "core");
  url.searchParams.set("sort", "cited desc");

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Europe PMC API error: ${res.status}`);
  }

  const data = await res.json();
  const resultList = data.resultList?.result ?? [];

  return {
    articles: resultList.map(parseArticle),
    total: data.hitCount ?? 0,
    page: params.page,
    pageSize: params.pageSize,
    source: "europepmc",
    nextCursorMark: data.nextCursorMark ?? undefined,
  };
}

export async function getSuggestions(query: string): Promise<string[]> {
  if (query.length < 2) return [];

  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("pageSize", "5");
  url.searchParams.set("resultType", "idlist");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const titles: string[] = (data.resultList?.result ?? [])
      .map((r: { title?: string }) => r.title?.replace(/<[^>]+>/g, "") ?? "")
      .filter(Boolean)
      .slice(0, 5);
    return titles;
  } catch {
    return [];
  }
}

export async function getFullTextXML(pmcid: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/${pmcid}/fullTextXML`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}
