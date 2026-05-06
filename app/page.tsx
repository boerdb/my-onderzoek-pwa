import type { Metadata } from "next";
import { SearchPage } from "@/components/search/SearchPage";

export const metadata: Metadata = {
  title: "MedSummary – Medisch Artikel Zoeker",
  description:
    "Zoek miljoenen medische artikelen via Europe PMC en PubMed. Genereer AI-uittreksels met Gemini.",
};

export default function Home() {
  return <SearchPage />;
}
