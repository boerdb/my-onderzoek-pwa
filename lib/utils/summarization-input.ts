/**
 * Extracts readable text from an Europe PMC full-text XML string.
 * Returns a clean plaintext snippet (max ~8000 chars).
 */
export function extractTextFromXML(xml: string): string {
  // Remove all XML tags, leaving only text content
  const text = xml
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Limit to ~8000 chars to keep within token limits
  return text.slice(0, 8000);
}
