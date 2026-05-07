import type { LevelInfo } from "@/lib/ebp/evidence-levels";

const COLOR_CLASSES: Record<
  LevelInfo["color"],
  { bg: string; text: string; border: string }
> = {
  green: {
    bg: "bg-green-50 dark:bg-green-950/50",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-950/50",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-200 dark:border-teal-800",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/50",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  zinc: {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-600 dark:text-zinc-400",
    border: "border-zinc-200 dark:border-zinc-700",
  },
};

interface EvidenceBadgeProps {
  info: LevelInfo;
}

export function EvidenceBadge({ info }: EvidenceBadgeProps) {
  const c = COLOR_CLASSES[info.color];
  return (
    <span
      title={info.description}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${c.bg} ${c.text} ${c.border}`}
    >
      <span className="font-bold">{info.level}</span>
      <span className="hidden sm:inline">{info.description}</span>
      <span className="sm:hidden">LoE {info.level}</span>
    </span>
  );
}
