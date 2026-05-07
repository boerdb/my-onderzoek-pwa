"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface SearchHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const SECTIONS = [
  {
    title: "Boolean operatoren",
    items: [
      {
        syntax: "AND",
        description: "Beide termen moeten voorkomen",
        example: "diabetes AND metformin",
      },
      {
        syntax: "OR",
        description: "Ten minste één van beide termen",
        example: "hypertension OR \"blood pressure\"",
      },
      {
        syntax: "NOT",
        description: "Eerste term wel, tweede niet",
        example: "stroke NOT hemorrhagic",
      },
      {
        syntax: "( )",
        description: "Groeperen van termen",
        example: "(diabetes OR insulin) AND treatment",
      },
    ],
  },
  {
    title: "Aanhalingstekens",
    items: [
      {
        syntax: "\"...\"",
        description: "Exacte woordvolgorde zoeken",
        example: "\"type 2 diabetes\"",
      },
    ],
  },
  {
    title: "Europe PMC veldfilters",
    items: [
      { syntax: "TITLE:term", description: "Alleen in de titel", example: "TITLE:metformin" },
      { syntax: "AUTH:naam", description: "Op auteursnaam", example: "AUTH:Smith" },
      { syntax: "JOURNAL:naam", description: "Op tijdschrift", example: "JOURNAL:Lancet" },
    ],
  },
  {
    title: "PubMed veldfilters",
    items: [
      { syntax: "term[Title]", description: "Alleen in de titel", example: "metformin[Title]" },
      { syntax: "naam[Author]", description: "Op auteursnaam", example: "Smith J[Author]" },
      { syntax: "naam[Journal]", description: "Op tijdschrift", example: "Lancet[Journal]" },
    ],
  },
];

export function SearchHelpModal({ open, onClose }: SearchHelpModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => onClose();
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="m-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-zinc-100 p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm dark:bg-zinc-950"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-zinc-100 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Zoektips &amp; Boolean operatoren
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Sluiten"
          className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-6 px-5 py-5">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {section.title}
            </h3>
            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
              {section.items.map((item, i) => (
                <div
                  key={item.syntax}
                  className={`flex items-start gap-3 bg-zinc-50 px-4 py-3 dark:bg-zinc-900 ${
                    i > 0
                      ? "border-t border-zinc-200 dark:border-zinc-800"
                      : ""
                  }`}
                >
                  <code className="mt-0.5 shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-sm font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    {item.syntax}
                  </code>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-700 dark:text-zinc-200">
                      {item.description}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                      Voorbeeld:{" "}
                      <code className="font-mono text-zinc-500 dark:text-zinc-400">
                        {item.example}
                      </code>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Tip: Boolean operatoren zijn hoofdlettergevoelig — schrijf ze in
          hoofdletters (<code className="text-zinc-500">AND</code>,{" "}
          <code className="text-zinc-500">OR</code>,{" "}
          <code className="text-zinc-500">NOT</code>).
        </p>
      </div>
    </dialog>
  );
}
