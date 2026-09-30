import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { CaptureButton } from "@/components/shell/capture-button";

export const metadata: Metadata = { title: "الأفكار" };

export default function IdeasPage() {
  return (
    <>
      <PageHeader
        title="الأفكار"
        english="Ideas"
        subtitle="صندوق أفكار واحد. الأفكار لا تتحول إلى مشاريع من تلقاء نفسها."
        action={<CaptureButton label="تدوين فكرة" />}
      />
      <Tabs items={["الوارد", "الحاضنة", "محفوظة", "تحولت إلى عمل"]} />
      <EmptyState icon={Lightbulb} title="صندوق الأفكار فارغ" phase={3}>
        دوّني أي شيء بالاختصار Ctrl K. ومرة في الأسبوع قرري لكل فكرة: الآن · بحث لاحقًا · احتفظ · احذف.
      </EmptyState>
    </>
  );
}
