import type { Metadata } from "next";
import { WifiOff, Search } from "lucide-react";
import Link from "next/link";
import { ReloadButton } from "./ReloadButton";

export const metadata: Metadata = {
  title: "Offline – MedSummary",
  description: "Je bent momenteel offline.",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <WifiOff className="h-10 w-10 text-zinc-400" />
      </div>
      <h1 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Geen internetverbinding
      </h1>
      <p className="mb-2 max-w-sm text-zinc-500 dark:text-zinc-400">
        MedSummary kan op dit moment geen artikelen ophalen. Controleer je
        verbinding en probeer het opnieuw.
      </p>
      <p className="mb-8 max-w-sm text-sm text-zinc-400 dark:text-zinc-500">
        Eerder gezochte resultaten kunnen nog steeds beschikbaar zijn via de
        cache.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Search className="h-4 w-4" />
          Ga naar zoeken
        </Link>
        <ReloadButton />
      </div>
    </div>
  );
}
