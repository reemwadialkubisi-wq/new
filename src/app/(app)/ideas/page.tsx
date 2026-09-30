import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { CaptureButton } from "@/components/shell/capture-button";

export const metadata: Metadata = { title: "Ideas" };

export default function IdeasPage() {
  return (
    <>
      <PageHeader
        title="Ideas"
        arabic="الأفكار"
        subtitle="One Idea Inbox. Ideas never become projects on their own."
        action={<CaptureButton label="Capture idea" />}
      />
      <Tabs items={["Inbox", "Incubator", "Kept", "Promoted"]} />
      <EmptyState icon={Lightbulb} title="Your Idea Inbox is empty" phase={3}>
        Capture anything with Ctrl K. Once a week, triage each idea: Do now · Research later · Keep · Delete.
      </EmptyState>
    </>
  );
}
