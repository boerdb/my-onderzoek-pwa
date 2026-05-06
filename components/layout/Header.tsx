"use client";

import { useState, useEffect, startTransition } from "react";
import { Moon, Sun, Stethoscope } from "lucide-react";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("medsummary:theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", dark);
    startTransition(() => setIsDark(dark));
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("medsummary:theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Med<span className="text-blue-600 dark:text-blue-400">Summary</span>
          </span>
        </div>

        <button
          type="button"
          onClick={toggleDark}
          aria-label={isDark ? "Lichte modus" : "Donkere modus"}
          className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}
