"use client";

import { useState, useEffect, useCallback } from "react";
import { Stethoscope, Search, Sparkles, BookOpen } from "lucide-react";

interface SplashScreenProps {
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 3000;

export function SplashScreen({ onDismiss }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const dismiss = useCallback(() => {
    setIsFading(true);
    setTimeout(onDismiss, 350);
  }, [onDismiss]);

  useEffect(() => {
    const interval = 20;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress(Math.min((elapsed / AUTO_DISMISS_MS) * 100, 100));
      if (elapsed >= AUTO_DISMISS_MS) {
        clearInterval(timer);
        dismiss();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [dismiss]);

  const secondsLeft = Math.max(
    1,
    Math.ceil(AUTO_DISMISS_MS / 1000 - (progress / 100) * (AUTO_DISMISS_MS / 1000))
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-6 transition-opacity duration-300 dark:bg-zinc-950 ${
        isFading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* Achtergrond-decoraties */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-blue-50 dark:bg-blue-950/20" />
        <div className="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-blue-50 dark:bg-blue-950/20" />
        <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-50/50 dark:bg-blue-950/10" />
      </div>

      <div className="relative flex w-full max-w-sm flex-col items-center gap-7 text-center">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Stethoscope className="h-8 w-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Med<span className="text-blue-600 dark:text-blue-400">Summary</span>
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
            Vind de Nieuwste{" "}
            <span className="text-blue-600 dark:text-blue-400">Medische Kennis.</span>
            <br />
            Snel. Betrouwbaar.
          </h1>
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Doorzoek miljoenen medische artikelen direct. Bespaar tijd en blijf
            up-to-date met AI-samenvattingen.
          </p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: Search, label: "PubMed & Europe PMC" },
            { icon: Sparkles, label: "AI-samenvatting" },
            { icon: BookOpen, label: "Miljoenen artikelen" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
            >
              <Icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>

        {/* Knoppen */}
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
          >
            App Openen
          </button>
          <a
            href="https://europepmc.org"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-center text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Hoe het Werkt
          </a>
        </div>

        {/* Auto-dismiss voortgang */}
        <div className="w-full space-y-2">
          <p className="text-xs text-zinc-400">
            Dit scherm verdwijnt automatisch over {secondsLeft}{" "}
            {secondsLeft === 1 ? "seconde" : "seconden"}…
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-none"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-label="Laadvoortgang"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
