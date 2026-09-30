import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "المشاريع" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="المشاريع"
        english="Projects"
        subtitle="عمل مؤقت له بداية ونهاية، يخدم هدفًا في الغالب."
        action={<Button variant="primary" disabled title="في المرحلة 4">مشروع جديد</Button>}
      />
      <Tabs items={["نشطة", "مخططة", "متوقفة مؤقتًا", "مكتملة", "مؤرشفة"]} />
      <EmptyState icon={FolderKanban} title="لا توجد مشاريع بعد" phase={4}>
        حتى 3 مشاريع نشطة في الوقت نفسه. لكل مشروع محطات رئيسية ويمكن ربطه بهدف.
      </EmptyState>
    </>
  );
}
