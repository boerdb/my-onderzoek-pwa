import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { QueryProvider } from "@/components/layout/QueryProvider";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { UpdatePrompt } from "@/components/pwa/UpdatePrompt";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s – MedSummary",
    default: "MedSummary – Medisch Artikel Zoeker",
  },
  description:
    "Zoek en vat medische artikelen samen met AI. Doorzoek Europe PMC en PubMed. Gestructureerde uittreksels gegenereerd door Gemini.",
  applicationName: "MedSummary",
  keywords: ["medische artikelen", "pubmed", "europe pmc", "ai samenvatting", "onderzoek"],
  authors: [{ name: "MedSummary" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MedSummary",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1d4ed8" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <QueryProvider>
          <ServiceWorkerRegister />
          <Header />
          <div className="flex flex-1 flex-col">{children}</div>
          <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
            MedSummary gebruikt Europe PMC en PubMed data. AI-uittreksels zijn informatief
            en geen medisch advies.
          </footer>
          <PwaInstallPrompt />
          <UpdatePrompt />
        </QueryProvider>
      </body>
    </html>
  );
}
