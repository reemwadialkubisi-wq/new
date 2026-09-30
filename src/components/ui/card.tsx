import { cn } from "@/lib/utils";

/** The one card style. Use sparingly: most content sits directly on the page. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-border bg-surface", className)} {...props} />;
}

/** Section heading used inside cards and on pages: small caps eyebrow + optional meta on the right. */
export function SectionTitle({
  children, meta, className, as: Tag = "h2",
}: { children: React.ReactNode; meta?: React.ReactNode; className?: string; as?: "h2" | "h3" }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", className)}>
      <Tag className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-3">{children}</Tag>
      {meta ? <div className="text-2xs text-ink-3">{meta}</div> : null}
    </div>
  );
}

export function Section({
  title, meta, children, className, bare,
}: { title: string; meta?: React.ReactNode; children: React.ReactNode; className?: string; bare?: boolean }) {
  const body = (
    <>
      <SectionTitle meta={meta}>{title}</SectionTitle>
      <div className="mt-4">{children}</div>
    </>
  );
  if (bare) return <section className={className}>{body}</section>;
  return <Card className={cn("p-6", className)}>{body}</Card>;
}
