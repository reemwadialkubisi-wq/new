import type { Metadata } from "next";
import { Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Intellectual Assets" };

const STAGES = ["Idea", "Research", "Write", "Publish", "Reuse"];

export default function AssetsPage() {
  return (
    <>
      <PageHeader
        title="Intellectual Assets"
        arabic="الأصول الفكرية"
        subtitle="Books, articles, research, courses, videos and frameworks you can reuse."
        action={<Button variant="primary" disabled title="Arrives in Phase 7">New asset</Button>}
      />
      <ol className="mb-6 grid grid-cols-5 gap-px overflow-hidden rounded-lg border border-border bg-border" aria-label="Asset pipeline">
        {STAGES.map((s, i) => (
          <li key={s} className="bg-surface px-3 py-3 sm:px-4">
            <div className="text-2xs tabular-nums text-ink-4">{i + 1}</div>
            <div className="text-xs font-medium text-ink-2 sm:text-sm">{s}</div>
            <div className="mt-1 text-2xs text-ink-4">0</div>
          </li>
        ))}
      </ol>
      <EmptyState icon={Library} title="No intellectual assets yet" phase={7}>
        Each asset moves through the pipeline and can be reused in talks, training and consulting.
      </EmptyState>
    </>
  );
}
