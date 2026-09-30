import type { Metadata } from "next";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "الأهداف" };

export default function GoalsPage() {
  return (
    <>
      <PageHeader
        title="الأهداف"
        english="Goals"
        subtitle="النتائج المطلوبة. هنا الأهداف السنوية وأهداف الربع، ولكل هدف مجال حياة واحد."
        action={<Button variant="primary" disabled title="في المرحلة 4">هدف جديد</Button>}
      />
      <Tabs items={["سنوية", "ربعية", "في الحاضنة", "مؤرشفة"]} />
      <EmptyState icon={Target} title="لا توجد أهداف بعد" phase={4}>
        حتى 5 أهداف سنوية نشطة. التقدم يأتي من المحطات الرئيسية أو من تقديرك، لا من عدد المهام.
        الأهداف المكتملة أو المتروكة تُؤرشف ولا تُحذف.
      </EmptyState>
    </>
  );
}
