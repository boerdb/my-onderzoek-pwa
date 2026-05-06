"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

export function UpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const checkForUpdate = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;

      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(newWorker);
          }
        });
      });
    };

    checkForUpdate();

    // Controleer ook op updates na terugkeer naar tabblad
    const onFocus = () => {
      navigator.serviceWorker.getRegistration().then((reg) => reg?.update());
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const handleUpdate = () => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    waitingWorker.addEventListener("statechange", () => {
      if (waitingWorker.state === "activated") {
        window.location.reload();
      }
    });
    window.location.reload();
  };

  if (!waitingWorker || dismissed) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-20 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl border border-blue-200 bg-white px-4 py-3 shadow-xl dark:border-blue-800 dark:bg-zinc-900"
    >
      <RefreshCw className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Nieuwe versie beschikbaar
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Vernieuwen om de update te installeren.
        </p>
      </div>
      <button
        type="button"
        onClick={handleUpdate}
        className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Vernieuwen
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Melding sluiten"
        className="shrink-0 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
