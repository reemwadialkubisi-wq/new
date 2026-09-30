"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuickCapture, type CaptureKind } from "./quick-capture";

export function CaptureButton({ label = "تدوين", kind, size }: { label?: string; kind?: CaptureKind; size?: "sm" | "md" }) {
  const { open } = useQuickCapture();
  return (
    <Button variant={size === "sm" ? "ghost" : "primary"} size={size} onClick={() => open(kind)}>
      <Plus aria-hidden />
      {label}
    </Button>
  );
}
