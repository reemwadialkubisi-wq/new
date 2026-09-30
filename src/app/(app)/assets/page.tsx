import type { Metadata } from "next";
import { Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "الأصول الفكرية" };

const STAGES = ["فكرة", "بحث", "كتابة", "نشر", "إعادة استخدام"];

export default function AssetsPage() {
  return (
    <>
      <PageHeader
        title="الأصول الفكرية"
        english="Intellectual Assets"
        subtitle="كتب ومقالات وأبحاث ودورات وفيديوهات وأطر عمل قابلة لإعادة الاستخدام."
        action={<Button variant="primary" disabled title="في المرحلة 7">أصل جديد</Button>}
      />
      <ol className="mb-6 grid grid-cols-5 gap-px overflow-hidden rounded-lg border border-border bg-border" aria-label="مسار الأصول">
        {STAGES.map((s, i) => (
          <li key={s} className="bg-surface px-3 py-3 sm:px-4">
            <div className="text-2xs tabular-nums text-ink-4">{i + 1}</div>
            <div className="text-xs font-medium text-ink-2 sm:text-sm">{s}</div>
            <div className="mt-1 text-2xs text-ink-4">0</div>
          </li>
        ))}
      </ol>
      <EmptyState icon={Library} title="لا توجد أصول فكرية بعد" phase={7}>
        كل أصل يمر بالمسار ويمكن إعادة استخدامه في المحاضرات والتدريب والاستشارات.
      </EmptyState>
    </>
  );
}
