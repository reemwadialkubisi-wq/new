import type { Metadata } from "next";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "Goals" };

export default function GoalsPage() {
  return (
    <>
      <PageHeader
        title="Goals"
        arabic="الأهداف"
        subtitle="Desired results. Annual goals and quarterly objectives live here, each with one Life Area."
        action={<Button variant="primary" disabled title="Arrives in Phase 4">New goal</Button>}
      />
      <Tabs items={["Annual", "Quarterly", "Incubating", "Archived"]} />
      <EmptyState icon={Target} title="No goals yet" phase={4}>
        Up to 5 active annual goals. Progress comes from milestones or your own estimate, never from task counts.
        Finished or dropped goals are archived, not deleted.
      </EmptyState>
    </>
  );
}
