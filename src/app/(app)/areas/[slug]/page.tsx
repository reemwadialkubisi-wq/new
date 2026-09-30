import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FolderKanban, Repeat, Target, CalendarRange, Sparkles } from "lucide-react";
import { Section } from "@/components/ui/card";
import { MainWithRail, PageHeader } from "@/components/ui/page-header";
import { Planned } from "@/components/ui/planned";
import { SignalDot } from "@/components/ui/status";
import { areaBySlug } from "@/lib/areas";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: areaBySlug((await params).slug)?.name ?? "مجال الحياة" };
}

/** ONE template for every Life Area page, with an optional area-specific extra. */
export default async function AreaPage({ params }: Props) {
  const area = areaBySlug((await params).slug);
  if (!area) notFound();
  // Knowledge and Intellectual Assets have their own single home.
  if (!area.href.startsWith("/areas/")) redirect(area.href);

  return (
    <>
      <PageHeader eyebrow="مجال حياة" title={area.name} english={area.english} subtitle={area.holds} />
      <MainWithRail
        main={
          <>
            {area.extra ? (
              <Planned title={area.extra.split(" · ")[0]} empty={area.extra.split(" · ")[1] ?? area.extra} icon={Sparkles} phase={area.phase} />
            ) : null}
            <Planned title="الأهداف والمشاريع" empty={`لا توجد أهداف أو مشاريع في ${area.name} بعد`} icon={Target} phase={4}>
              تظهر هنا الأهداف والمشاريع المرتبطة بهذا المجال، وتُعدَّل من صفحتي الأهداف والمشاريع.
            </Planned>
            <Planned title="هذا الأسبوع" empty="لا شيء مخطط لهذا المجال هذا الأسبوع" icon={CalendarRange} phase={3} />
          </>
        }
        rail={
          <>
            <Section title="الإشارة">
              <SignalDot signal={null} />
            </Section>
            <Planned title="العادات والحد الأدنى الأسبوعي" empty="لا توجد عادات بعد" icon={Repeat} phase={5}>
              أنظمة مستمرة بحد أدنى أسبوعي، بلا سلاسل متتالية.
            </Planned>
            <Planned title="مشاريع مرتبطة" empty="لا شيء بعد" icon={FolderKanban} phase={4} />
          </>
        }
      />
    </>
  );
}
