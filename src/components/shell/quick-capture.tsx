"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CalendarClock, CheckSquare, Lightbulb, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/status";
import { cn } from "@/lib/utils";

type CaptureKind = "idea" | "task" | "outcome" | "date";
const KINDS: { value: CaptureKind; label: string; icon: typeof Lightbulb; lands: string }[] = [
  { value: "idea", label: "Idea", icon: Lightbulb, lands: "Goes to the Idea Inbox. It never becomes a project on its own." },
  { value: "task", label: "Task", icon: CheckSquare, lands: "Goes to Today, or to a day you choose." },
  { value: "outcome", label: "Outcome", icon: Target, lands: "Becomes a Weekly Outcome for this week." },
  { value: "date", label: "Date", icon: CalendarClock, lands: "An appointment, important date or deadline." },
];

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const useQuickCapture = () => useContext(Ctx);

export function QuickCaptureProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <QuickCaptureDialog open={isOpen} onOpenChange={setOpen} />
    </Ctx.Provider>
  );
}

function QuickCaptureDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [kind, setKind] = useState<CaptureKind>("idea");
  const [text, setText] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setKind("idea");
      setNote(null);
    }
  }, [open]);

  const current = KINDS.find((k) => k.value === kind)!;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setNote("Write a few words first.");
      inputRef.current?.focus();
      return;
    }
    // Phase 1 is the shell only. Saving connects to the database in Phase 3 (Ideas/Tasks) — see roadmap.
    setNote("Captured in this preview only. Saving to your Inbox connects once the database is live.");
    setText("");
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[2px] dark:bg-black/50" />
        <Dialog.Content
          className="fixed left-1/2 top-[14vh] z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 rounded-lg border border-border bg-surface shadow-pop focus:outline-none"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <form onSubmit={submit}>
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <Dialog.Title className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-3">Quick Capture</Dialog.Title>
              <Dialog.Close className="rounded-sm p-1 text-ink-3 hover:bg-surface-2 hover:text-ink" aria-label="Close">
                <X className="size-4" />
              </Dialog.Close>
            </div>
            <div className="px-5 pt-4">
              <label htmlFor="capture-text" className="sr-only">What's on your mind?</label>
              <textarea
                id="capture-text"
                ref={inputRef}
                dir="auto"
                rows={3}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (note) setNote(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
                }}
                placeholder="What's on your mind? · ما الذي يدور في ذهنك؟"
                className="w-full resize-none bg-transparent text-base leading-relaxed text-ink placeholder:text-ink-4 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 px-5 pb-3" role="radiogroup" aria-label="Capture as">
              {KINDS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={kind === value}
                  onClick={() => setKind(value)}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                    kind === value ? "border-accent bg-accent-soft text-accent-text" : "border-border text-ink-2 hover:bg-surface-2",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 border-t border-border bg-surface-2/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-ink-3" aria-live="polite">{note ?? current.lands}</p>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden items-center gap-1 text-2xs text-ink-4 sm:inline-flex"><Kbd>Ctrl</Kbd><Kbd>↵</Kbd></span>
                <Button type="submit" variant="primary" size="sm">Capture</Button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
