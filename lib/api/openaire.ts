import type { Article, SearchParams, SearchResult } from "@/lib/types/article";

const BASE_URL =
  process.env.OPENAIRE_BASE_URL ||
  "https://api.openaire.eu/search/publications";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getString(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (typeof node === "object" && "$" in node) return String(node["$"] ?? "");
  return "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAttr(node: any, attr: string): string {
  if (!node || typeof node !== "object") return "";
  return String(node[`@${attr}`] ?? node[attr] ?? "");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toArray<T>(val: T | T[] | undefined): T[] {
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? val : [val];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseArticle(item: any): Article | null {
  try {
    const id = getString(item?.header?.["dri:objIdentifier"]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = item?.metadata?.["oaf:entity"]?.["oaf:result"];
    if (!result) return null;

    // Title — can be array or single object
    const titles = toArray(result.title);
    const mainTitle =
      titles.find((t) => getAttr(t, "classid") === "main title") ??
      titles[0];
    const title = getString(mainTitle)?.replace(/<[^>]+>/g, "").trim();
    if (!title) return null;

    // Authors
    const authors = toArray(result.creator)
      .slice(0, 5)
      .map((c) => getString(c))
      .filter(Boolean);

    // Date
    const publicationDate = getString(result.dateofacceptance)?.slice(0, 10) ?? "";

    // Abstract
    const descriptions = toArray(result.description);
    const abstract = getString(descriptions[0])?.replace(/<[^>]+>/g, "").trim() || undefined;

    // DOI
    const pids = toArray(result.pid);
    const doiPid = pids.find((p) => getAttr(p, "classid") === "doi");
    const doi = getString(doiPid) || undefined;

    // Journal
    const journalNode = Array.isArray(result.journal)
      ? result.journal[0]
      : result.journal;
    const journal = getString(journalNode) || undefined;

    // Open access
    const accessRight =
      getAttr(result.bestaccessright, "classid") ||
      getAttr(result.bestlicense, "classid");
    const isOpenAccess = accessRight.toUpperCase() === "OPEN" ||
      accessRight.toUpperCase().includes("OPEN");

    // Pub types
    const resourcetypes = toArray(result.resourcetype);
    const pubTypes = resourcetypes
      .map((r) => getAttr(r, "classname"))
      .filter(Boolean);

    const url = doi
      ? `https://doi.org/${doi}`
      : `https://explore.openaire.eu/search/publication?articleId=${encodeURIComponent(id)}`;

    return {
      id: `openaire-${id || Math.random().toString(36).slice(2)}`,
      source: "openaire",
      title,
      authors,
      publicationDate,
      journal,
      abstract,
      doi,
      isOpenAccess,
      isReview: pubTypes.some((t) => t.toLowerCase().includes("review")),
      language: "nl",
      url,
      pubTypes: pubTypes.length > 0 ? pubTypes : undefined,
    };
  } catch {
    return null;
  }
}

export async function searchOpenAIRE(
  params: SearchParams,
  maxResults = 8
): Promise<Article[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set("keywords", params.query);
  url.searchParams.set("country", "NL");
  url.searchParams.set("format", "json");
  url.searchParams.set("page", "1");
  url.searchParams.set("size", String(maxResults));
  url.searchParams.set("sortBy", "resultdateofacceptance,descending");

  if (params.filters.openAccessOnly) {
    url.searchParams.set("OA", "true");
  }
  if (params.filters.yearFrom) {
    url.searchParams.set(
      "fromDateAccepted",
      `${params.filters.yearFrom}-01-01`
    );
  }
  if (params.filters.yearTo) {
    url.searchParams.set(
      "toDateAccepted",
      `${params.filters.yearTo}-12-31`
    );
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`OpenAIRE API error: ${res.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await res.json()) as any;
  const results = toArray(data?.response?.results?.result ?? []);

  return results
    .map(parseArticle)
    .filter((a): a is Article => a !== null);
}
