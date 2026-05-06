import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAISummary } from "@/lib/ai/gemini";
import { getFullTextXML } from "@/lib/api/europepmc";
import { extractTextFromXML } from "@/lib/utils/summarization-input";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_SUMMARY ?? "10", 10);

const summarySchema = z.object({
  articleId: z.string().min(1).max(100),
  title: z.string().min(1).max(1000),
  abstract: z.string().min(10).max(10000),
  pmcid: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, remaining } = checkRateLimit(
    getRateLimitKey(ip, "summary"),
    MAX_REQUESTS
  );

  if (!allowed) {
    return NextResponse.json(
      {
        error:
          "Te veel samenvattingsverzoeken. Probeer het over een minuut opnieuw.",
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige request body" }, { status: 400 });
  }

  const parsed = summarySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ontbrekende of ongeldige velden", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { articleId, title, abstract, pmcid } = parsed.data;

  let fullTextSnippet: string | undefined;
  if (pmcid) {
    const xml = await getFullTextXML(pmcid);
    if (xml) {
      fullTextSnippet = extractTextFromXML(xml);
    }
  }

  try {
    const summary = await generateAISummary(
      articleId,
      title,
      abstract,
      fullTextSnippet
    );

    return NextResponse.json(summary, {
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Onbekende fout";
    console.error("AI summary error:", message);

    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "AI-service niet geconfigureerd. Voeg een GEMINI_API_KEY toe." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "AI-samenvatting kon niet worden gegenereerd. Probeer het later opnieuw." },
      { status: 502 }
    );
  }
}
