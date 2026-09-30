import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SignalDot } from "@/components/ui/status";
import { LIFE_AREAS } from "@/lib/areas";

export const metadata: Metadata = { title: "مجالات الحياة" };

export default function AreasPage() {
  return (
    <>
      <PageHeader
        title="مجالات الحياة"
        english="Life Areas"
        subtitle="أحد عشر مجالًا، لكل منها إشارة هادئة: على المسار · يحتاج انتباهًا · في استراحة."
      />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {LIFE_AREAS.map((a) => {
          const Icon = a.icon;
          return (
            <li key={a.slug}>
              <Link href={a.href} className="flex h-full flex-col gap-3 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-md bg-surface-2 text-ink-2">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <SignalDot signal={null} withLabel={false} />
                </div>
                <div>
                  <div className="text-base font-medium text-ink">{a.name}</div>
                  <div lang="en" dir="ltr" className="text-end text-xs text-ink-3">{a.english}</div>
                </div>
                <p className="text-xs text-ink-3">{a.holds}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
