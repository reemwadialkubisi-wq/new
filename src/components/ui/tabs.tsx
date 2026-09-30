import { cn } from "@/lib/utils";

/** Static view tabs (first one selected). Becomes interactive when the data arrives. */
export function Tabs({ items, className }: { items: string[]; className?: string }) {
  return (
    <div role="tablist" aria-label="Views" className={cn("mb-6 flex gap-5 overflow-x-auto border-b border-border", className)}>
      {items.map((t, i) => (
        <span
          key={t}
          role="tab"
          aria-selected={i === 0}
          className={cn(
            "-mb-px shrink-0 border-b-2 pb-2.5 text-sm",
            i === 0 ? "border-ink font-medium text-ink" : "border-transparent text-ink-3",
          )}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
