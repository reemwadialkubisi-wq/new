import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import { Section } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CaptureButton } from "@/components/shell/capture-button";
import { IdeaList } from "@/components/plan/items";
import { listIdeas } from "@/db/repo";

export const metadata: Metadata = { title: "الأفكار" };

export default function IdeasPage() {
  const ideas = listIdeas();
  return (
    <>
      <PageHeader
        title="الأفكار"
        english="Ideas"
        subtitle="صندوق أفكار واحد. الأفكار لا تتحول إلى مشاريع من تلقاء نفسها."
        action={<CaptureButton label="تدوين فكرة" kind="idea" />}
      />
      {ideas.length ? (
        <Section title="الوارد · Inbox" meta={<span className="tabular-nums">{ideas.length}</span>}>
          <IdeaList items={ideas} />
          <p className="mt-4 text-2xs text-ink-4">
            الفرز الأسبوعي (الآن · بحث لاحقًا · احتفظ · احذف) والحاضنة يأتيان في مرحلة لاحقة.
          </p>
        </Section>
      ) : (
        <EmptyState icon={Lightbulb} title="صندوق الأفكار فارغ">
          دوّني أي شيء بالاختصار Ctrl K. ومرة في الأسبوع قرري لكل فكرة: الآن · بحث لاحقًا · احتفظ · احذف.
        </EmptyState>
      )}
    </>
  );
}
