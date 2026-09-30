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
  return { title: areaBySlug((await params).slug)?.name ?? "Life Area" };
}

/** ONE template for every Life Area page, with an optional area-specific extra. */
export default async function AreaPage({ params }: Props) {
  const area = areaBySlug((await params).slug);
  if (!area) notFound();
  // Knowledge and Intellectual Assets have their own single home.
  if (!area.href.startsWith("/areas/")) redirect(area.href);

  return (
    <>
      <PageHeader eyebrow="Life Area" title={area.name} arabic={area.arabic} subtitle={area.holds} />
      <MainWithRail
        main={
          <>
            {area.extra ? (
              <Planned title={area.extra.split(":")[0]} empty={area.extra} icon={Sparkles} phase={area.phase} />
            ) : null}
            <Planned title="Goals & Projects" empty={`No goals or projects in ${area.name} yet`} icon={Target} phase={4}>
              Goals and projects tagged with this area appear here. They are edited in Goals and Projects.
            </Planned>
            <Planned title="This week" empty="Nothing planned for this area this week" icon={CalendarRange} phase={3} />
          </>
        }
        rail={
          <>
            <Section title="Signal">
              <SignalDot signal={null} />
            </Section>
            <Planned title="Habits & weekly minimums" empty="No habits yet" icon={Repeat} phase={5}>
              Continuous systems with a weekly minimum. No streaks.
            </Planned>
            <Planned title="Related projects" empty="None yet" icon={FolderKanban} phase={4} />
          </>
        }
      />
    </>
  );
}
