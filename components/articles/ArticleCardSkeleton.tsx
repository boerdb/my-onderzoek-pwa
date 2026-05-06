export function ArticleCardSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900"
      aria-hidden="true"
    >
      <div className="mb-3 flex gap-2">
        <div className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="mb-2 h-5 w-4/5 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="mb-4 h-4 w-3/5 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="mb-2 h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="mb-2 h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="mb-4 h-3 w-2/3 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="flex gap-2 pt-3">
        <div className="h-7 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-7 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
  );
}
