import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchEuropePMC } from "@/lib/api/europepmc";
import { searchPubMed } from "@/lib/api/pubmed";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_SEARCH ?? "30", 10);

const searchSchema = z.object({
  query: z.string().min(1).max(500),
  page: z.coerce.number().int().min(1).max(100).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  yearFrom: z.coerce.number().int().min(1900).max(2100).optional(),
  yearTo: z.coerce.number().int().min(1900).max(2100).optional(),
  openAccessOnly: z.coerce.boolean().default(false),
  reviewsOnly: z.coerce.boolean().default(false),
  language: z.string().max(10).optional(),
  cursorMark: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, remaining } = checkRateLimit(
    getRateLimitKey(ip, "search"),
    MAX_REQUESTS
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het over een minuut opnieuw." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      }
    );
  }

  const { searchParams } = request.nextUrl;
  const parsed = searchSchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ongeldige zoekopdracht", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { query, page, pageSize, yearFrom, yearTo, openAccessOnly, reviewsOnly, language, cursorMark } =
    parsed.data;

  const params = {
    query,
    page,
    pageSize,
    filters: { yearFrom, yearTo, openAccessOnly, reviewsOnly, language },
    cursorMark,
  };

  try {
    const result = await searchEuropePMC(params);

    if (result.articles.length > 0 || result.total > 0) {
      return NextResponse.json(result, {
        headers: {
          "X-RateLimit-Remaining": String(remaining),
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    }

    // Fallback to PubMed
    const pubmedResult = await searchPubMed(params);
    return NextResponse.json(pubmedResult, {
      headers: {
        "X-RateLimit-Remaining": String(remaining),
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    // Try PubMed fallback on Europe PMC error
    try {
      const pubmedResult = await searchPubMed(params);
      return NextResponse.json(pubmedResult, {
        headers: { "X-RateLimit-Remaining": String(remaining) },
      });
    } catch {
      console.error("Search error (both providers):", error);
      return NextResponse.json(
        { error: "Zoekdienst tijdelijk niet beschikbaar. Probeer het later opnieuw." },
        { status: 503 }
      );
    }
  }
}
