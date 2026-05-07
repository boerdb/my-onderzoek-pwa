"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 transition-opacity duration-300 ${
        isFading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* Achtergrondafbeelding */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <Image
          src="/bibliotheek.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        {/* Donkere overlay voor leesbaarheid */}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative flex w-full max-w-sm flex-col items-center gap-7 text-center">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Stethoscope className="h-8 w-8 text-blue-400" aria-hidden="true" />
          <span className="text-2xl font-bold tracking-tight text-white">
            Med<span className="text-blue-400">Summary</span>
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white">
            Vind de Nieuwste{" "}
            <span className="text-blue-400">Medische Kennis.</span>
            <br />
            Snel. Betrouwbaar.
          </h1>
          <p className="text-sm leading-relaxed text-zinc-300">
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
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-sm"
            >
              <Icon className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>

        {/* Knop */}
        <button
          type="button"
          onClick={dismiss}
          className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-500 active:scale-95"
        >
          App Openen
        </button>

        {/* Auto-dismiss voortgang */}
        <div className="w-full space-y-2">
          <p className="text-xs text-zinc-400">
            Dit scherm verdwijnt automatisch over {secondsLeft}{" "}
            {secondsLeft === 1 ? "seconde" : "seconden"}…
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-blue-400 transition-none"
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
