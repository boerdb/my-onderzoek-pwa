import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSuggestions } from "@/lib/api/europepmc";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

const suggestSchema = z.object({
  q: z.string().min(2).max(200),
});

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(
    getRateLimitKey(ip, "suggest"),
    60
  );

  if (!allowed) {
    return NextResponse.json([], { status: 429 });
  }

  const { searchParams } = request.nextUrl;
  const parsed = suggestSchema.safeParse({ q: searchParams.get("q") });

  if (!parsed.success) {
    return NextResponse.json([], { status: 400 });
  }

  const suggestions = await getSuggestions(parsed.data.q);

  return NextResponse.json(suggestions, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
