import { GoogleGenAI } from "@google/genai";
import type { AISummary } from "@/lib/types/article";

const MODEL_NAME = "gemini-2.5-flash";

const SUMMARY_PROMPT = `
Je bent een medisch onderzoeksassistent. Genereer een gestructureerde Nederlandse samenvatting van het onderstaande medische artikel.

Antwoord UITSLUITEND in geldige JSON met deze structuur (geen extra tekst erbuiten):
{
  "shortSummary": "3-5 zinnen samenvatting",
  "objective": "Doel van de studie",
  "methods": "Gebruikte methoden en studieopzet",
  "results": "Belangrijkste resultaten en bevindingen",
  "conclusion": "Conclusie van de auteurs",
  "clinicalRelevance": "Klinische relevantie voor de praktijk",
  "limitations": "Beperkingen van de studie"
}

ARTIKEL INFORMATIE:
`.trim();

export async function generateAISummary(
  articleId: string,
  title: string,
  abstract: string,
  fullTextSnippet?: string
): Promise<AISummary> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const ai = new GoogleGenAI({ apiKey });

  const textInput = [
    `Titel: ${title}`,
    "",
    `Abstract: ${abstract}`,
    fullTextSnippet
      ? `\nUittreksels uit volledige tekst:\n${fullTextSnippet.slice(0, 6000)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `${SUMMARY_PROMPT}\n\n${textInput}`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });

  const text = response.text ?? "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Gemini returned invalid JSON response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    shortSummary: string;
    objective: string;
    methods: string;
    results: string;
    conclusion: string;
    clinicalRelevance: string;
    limitations: string;
  };

  return {
    articleId,
    shortSummary: parsed.shortSummary ?? "",
    objective: parsed.objective ?? "",
    methods: parsed.methods ?? "",
    results: parsed.results ?? "",
    conclusion: parsed.conclusion ?? "",
    clinicalRelevance: parsed.clinicalRelevance ?? "",
    limitations: parsed.limitations ?? "",
    generatedAt: new Date().toISOString(),
    model: MODEL_NAME,
  };
}
