import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "المعرفة" };

export default function KnowledgePage() {
  return (
    <>
      <PageHeader
        title="المعرفة"
        english="Knowledge"
        subtitle="ملاحظات المعرفة المحفوظة. هذه الصفحة هي مجال المعرفة نفسه."
        action={<Button variant="primary" disabled title="في المرحلة 6">ملاحظة جديدة</Button>}
      />
      <div className="mb-6 max-w-md">
        <Input aria-label="البحث في المعرفة" placeholder="ابحثي في الملاحظات…" disabled />
      </div>
      <EmptyState icon={BookOpen} title="لا توجد ملاحظات معرفة بعد" phase={6}>
        ملاحظات من القراءة والدورات والحوارات، مرتبطة بالأفكار والأصول الفكرية.
      </EmptyState>
    </>
  );
}
