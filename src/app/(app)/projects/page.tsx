import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        arabic="المشاريع"
        subtitle="Temporary work with a start and an end, usually serving a goal."
        action={<Button variant="primary" disabled title="Arrives in Phase 4">New project</Button>}
      />
      <Tabs items={["Active", "Planned", "Paused", "Completed", "Archived"]} />
      <EmptyState icon={FolderKanban} title="No projects yet" phase={4}>
        Up to 3 active projects at a time. Each project has milestones and can link to a goal.
      </EmptyState>
    </>
  );
}
