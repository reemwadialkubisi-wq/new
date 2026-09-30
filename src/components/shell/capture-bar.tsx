"use client";

import { Plus } from "lucide-react";
import { Kbd } from "@/components/ui/status";
import { useQuickCapture } from "./quick-capture";

export function CaptureBar() {
  const { open } = useQuickCapture();
  return (
    <button
      type="button"
      onClick={open}
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-5 py-4 text-left text-sm text-ink-3 transition-colors hover:border-border-strong hover:text-ink-2"
    >
      <Plus className="size-4" aria-hidden />
      <span className="flex-1">Quick capture: an idea, task, outcome or date…</span>
      <span className="hidden gap-0.5 sm:flex"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
    </button>
  );
}
