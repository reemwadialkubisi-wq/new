"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition } from "react";
import { captureAction } from "@/app/(app)/actions";
import { CalendarClock, CheckSquare, Lightbulb, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/status";
import { cn } from "@/lib/utils";

export type CaptureKind = "idea" | "task" | "outcome" | "date";
const KINDS: { value: CaptureKind; label: string; icon: typeof Lightbulb; lands: string }[] = [
  { value: "idea", label: "فكرة", icon: Lightbulb, lands: "تذهب إلى صندوق الأفكار، ولا تتحول إلى مشروع من تلقاء نفسها." },
  { value: "task", label: "مهمة", icon: CheckSquare, lands: "تذهب إلى اليوم، أو إلى يوم تختارينه." },
  { value: "outcome", label: "نتيجة", icon: Target, lands: "تصبح Weekly Outcome لهذا الأسبوع." },
  { value: "date", label: "موعد", icon: CalendarClock, lands: "يذهب إلى التواريخ المهمة، ويظهر في الأسبوع والشهر والسنة." },
];

const Ctx = createContext<{ open: (kind?: CaptureKind) => void }>({ open: () => {} });
export const useQuickCapture = () => useContext(Ctx);

export function QuickCaptureProvider({ children, today }: { children: React.ReactNode; today: string }) {
  const [isOpen, setOpen] = useState(false);
  const [startKind, setStartKind] = useState<CaptureKind>("idea");
  const open = useCallback((kind: CaptureKind = "idea") => {
    setStartKind(kind);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setStartKind("idea");
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <QuickCaptureDialog open={isOpen} onOpenChange={setOpen} today={today} startKind={startKind} />
    </Ctx.Provider>
  );
}

function QuickCaptureDialog({
  open, onOpenChange, today, startKind,
}: { open: boolean; onOpenChange: (v: boolean) => void; today: string; startKind: CaptureKind }) {
  const [kind, setKind] = useState<CaptureKind>("idea");
  const [text, setText] = useState("");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState<{ text: string; tone: "ok" | "error" } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setKind(startKind);
      setNote(null);
      setDate(today);
    }
  }, [open, today, startKind]);

  const current = KINDS.find((k) => k.value === kind)!;

  const withDate = kind === "task" || kind === "date";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (!text.trim()) {
      setNote({ text: "اكتبي بضع كلمات أولًا.", tone: "error" });
      inputRef.current?.focus();
      return;
    }
    startTransition(async () => {
      const res = await captureAction({ kind, text, date: withDate ? date : undefined });
      if (res.ok) {
        setNote({ text: res.message ?? "حُفظت.", tone: "ok" });
        setText("");
        router.refresh();
        inputRef.current?.focus();
      } else {
        const first = Object.values(res.errors ?? {})[0] ?? "لم تُحفظ. حاولي مرة أخرى.";
        setNote({ text: first, tone: "error" });
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[2px] dark:bg-black/50" />
        <Dialog.Content
          className="fixed inset-x-0 top-[14vh] z-50 mx-auto w-[calc(100vw-2rem)] max-w-xl rounded-lg border border-border bg-surface shadow-pop focus:outline-none"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <form onSubmit={submit}>
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <Dialog.Title className="text-xs font-semibold text-ink-3">التدوين السريع · Quick Capture</Dialog.Title>
              <Dialog.Close className="rounded-sm p-1 text-ink-3 hover:bg-surface-2 hover:text-ink" aria-label="إغلاق">
                <X className="size-4" />
              </Dialog.Close>
            </div>
            <div className="px-5 pt-4">
              <label htmlFor="capture-text" className="sr-only">ما الذي يدور في ذهنك؟</label>
              <textarea
                id="capture-text"
                ref={inputRef}
                dir="auto"
                rows={3}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (note?.tone === "error") setNote(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
                }}
                placeholder="ما الذي يدور في ذهنك؟"
                className="w-full resize-none bg-transparent text-base leading-relaxed text-ink placeholder:text-ink-4 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 px-5 pb-3" role="radiogroup" aria-label="نوع التدوين">
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
            {withDate ? (
              <div className="flex items-center gap-3 px-5 pb-3">
                <label htmlFor="capture-date" className="text-xs text-ink-2">
                  {kind === "task" ? "اليوم (اختياري)" : "التاريخ"}
                </label>
                <input
                  id="capture-date"
                  type="date"
                  dir="ltr"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-8 rounded-md border border-border-strong bg-surface px-2 text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>
            ) : null}
            <div className="flex flex-col gap-3 border-t border-border bg-surface-2/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p
                className={cn("text-xs", note?.tone === "error" ? "text-red-text" : note ? "font-medium text-ink" : "text-ink-3")}
                aria-live="polite"
                data-testid="capture-note"
              >
                {note?.text ?? current.lands}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <span dir="ltr" className="hidden items-center gap-1 text-2xs text-ink-4 sm:inline-flex"><Kbd>Ctrl</Kbd><Kbd>↵</Kbd></span>
                <Button type="submit" variant="primary" size="sm" disabled={pending}>{pending ? "جارٍ الحفظ…" : "دوِّني"}</Button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
