"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuickCapture } from "./quick-capture";

export function CaptureButton({ label = "Capture" }: { label?: string }) {
  const { open } = useQuickCapture();
  return (
    <Button variant="primary" onClick={open}>
      <Plus aria-hidden />
      {label}
    </Button>
  );
}
