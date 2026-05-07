import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_SUMMARY ?? "10", 10);

const schema = z.object({
  patient: z.string().max(300).default(""),
  intervention: z.string().max(300).default(""),
  comparison: z.string().max(300).default(""),
  outcome: z.string().max(300).default(""),
  timeframe: z.string().max(300).default(""),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(
    getRateLimitKey(ip, "translate"),
    MAX_REQUESTS
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het over een minuut opnieuw." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige velden" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI-vertaalservice niet geconfigureerd." },
      { status: 503 }
    );
  }

  const { patient, intervention, comparison, outcome, timeframe } = parsed.data;

  const prompt = `Je bent een medisch vertaler. Vertaal de volgende PICO-zoekvelden van het Nederlands naar Engelse medische zoektermen, geschikt voor gebruik in PubMed en Europe PMC. Gebruik gangbare Engelse medische terminologie.

Antwoord UITSLUITEND in geldige JSON met dezelfde veldnamen, geen extra tekst:
{
  "patient": "...",
  "intervention": "...",
  "comparison": "...",
  "outcome": "...",
  "timeframe": "..."
}

PICO-velden om te vertalen:
- patient: "${patient}"
- intervention: "${intervention}"
- comparison: "${comparison}"
- outcome: "${outcome}"
- timeframe: "${timeframe}"

Vertaal alleen niet-lege velden. Lege velden laat je leeg ("").`.trim();

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Geen geldig JSON antwoord");

    const result = JSON.parse(jsonMatch[0]) as Record<string, string>;

    return NextResponse.json({
      patient: result.patient ?? patient,
      intervention: result.intervention ?? intervention,
      comparison: result.comparison ?? comparison,
      outcome: result.outcome ?? outcome,
      timeframe: result.timeframe ?? timeframe,
    });
  } catch (error) {
    console.error("PICO translate error:", error);
    return NextResponse.json(
      { error: "Vertaling mislukt. Probeer het later opnieuw." },
      { status: 502 }
    );
  }
}
