"use client";

import { useState, useRef, useCallback, useEffect, startTransition } from "react";
import { Search, X, Clock } from "lucide-react";
import { getSearchHistory } from "@/lib/storage/history";
import type { SearchHistoryEntry } from "@/lib/types/article";

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ initialQuery = "", onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    startTransition(() => setHistory(getSearchHistory()));
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data as string[]);
      }
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setValue(q);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 300);
  };

  const handleSubmit = (q?: string) => {
    const query = (q ?? value).trim();
    if (!query) return;
    setValue(query);
    setSuggestions([]);
    setShowDropdown(false);
    onSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const items = [...(value.length >= 3 ? suggestions : []), ...history.slice(0, 3).map((h) => h.query)];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && items[activeIndex]) {
        handleSubmit(items[activeIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const dropdownItems =
    value.length >= 3 ? suggestions : history.slice(0, 5).map((h) => h.query);
  const showHistory = value.length < 3;

  return (
    <div className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        role="search"
        className="relative flex items-center"
      >
        <label htmlFor="search-input" className="sr-only">
          Zoek medische artikelen
        </label>
        <div className="relative flex w-full items-center rounded-2xl border border-zinc-200 bg-white shadow-sm ring-offset-white transition-shadow focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-offset-zinc-950">
          <Search
            className="ml-4 h-5 w-5 shrink-0 text-zinc-400"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            id="search-input"
            type="search"
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown && dropdownItems.length > 0}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-controls="search-listbox"
            aria-activedescendant={
              activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
            }
            value={value}
            onChange={handleChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Zoek medische artikelen, bijv. 'diabetes type 2 behandeling'…"
            className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-50"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                setValue("");
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              aria-label="Zoekopdracht wissen"
              className="mr-2 rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="mr-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isLoading ? "Zoeken…" : "Zoek"}
          </button>
        </div>
      </form>

      {showDropdown && dropdownItems.length > 0 && (
        <ul
          id="search-listbox"
          role="listbox"
          aria-label={showHistory ? "Zoekgeschiedenis" : "Suggesties"}
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {showHistory && (
            <li className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
              <Clock className="h-3 w-3" />
              Recente zoekopdrachten
            </li>
          )}
          {dropdownItems.map((item, i) => (
            <li
              key={item}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={activeIndex === i}
              onMouseDown={() => handleSubmit(item)}
              className={`cursor-pointer px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 ${
                activeIndex === i
                  ? "bg-blue-50 dark:bg-blue-900/30"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
