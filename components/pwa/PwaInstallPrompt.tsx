"use client";

import { useState, useEffect, startTransition } from "react";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    const standalone = window.matchMedia("(display-mode: standalone)").matches;

    startTransition(() => {
      setIsIOS(ios);
      setIsStandalone(standalone);
    });

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  };

  if (isStandalone || dismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <div
      role="banner"
      className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Installatiebanner sluiten"
        className="absolute right-3 top-3 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Installeer MedSummary
          </p>
          {isIOS ? (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Tik op{" "}
              <Share className="inline h-3.5 w-3.5" aria-label="Deel" /> en
              kies &ldquo;Zet op beginscherm&rdquo;.
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Voeg toe aan beginscherm voor snelle toegang, ook offline.
            </p>
          )}

          {!isIOS && deferredPrompt && (
            <button
              type="button"
              onClick={handleInstall}
              className="mt-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Installeren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
