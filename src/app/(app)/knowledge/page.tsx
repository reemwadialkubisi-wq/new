import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Knowledge" };

export default function KnowledgePage() {
  return (
    <>
      <PageHeader
        title="Knowledge"
        arabic="المعرفة"
        subtitle="Saved knowledge notes. This page is the Knowledge life area."
        action={<Button variant="primary" disabled title="Arrives in Phase 6">New note</Button>}
      />
      <div className="mb-6 max-w-md">
        <Input aria-label="Search knowledge" placeholder="Search notes…" disabled />
      </div>
      <EmptyState icon={BookOpen} title="No knowledge notes yet" phase={6}>
        Notes from reading, courses and conversations, linked to ideas and intellectual assets.
      </EmptyState>
    </>
  );
}
