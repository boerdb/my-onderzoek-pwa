"use client";

import { useState, useEffect, startTransition } from "react";
import { Moon, Sun, Stethoscope, Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getFavorites } from "@/lib/storage/favorites";

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setFavCount(getFavorites().length);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "medsummary:favorites") setFavCount(getFavorites().length);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    setFavCount(getFavorites().length);
  }, [pathname]);

  useEffect(() => {
    const stored = localStorage.getItem("medsummary:theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
    startTransition(() => setIsDark(dark));
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);
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

        <div className="flex items-center gap-1">
          <Link
            href="/favorieten"
            aria-label={`Favorieten${favCount > 0 ? ` (${favCount})` : ""}`}
            className="relative rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <Heart className={`h-5 w-5 ${pathname === "/favorieten" ? "fill-red-500 text-red-500" : ""}`} />
            {favCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold leading-none text-white">
                {favCount > 99 ? "99+" : favCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={toggleDark}
            aria-label={isDark ? "Lichte modus" : "Donkere modus"}
            className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
