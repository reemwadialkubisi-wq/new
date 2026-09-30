import { Check, EyeOff } from "lucide-react";
import {
  archiveIdeaAction, archiveOutcomeAction, archiveTaskAction, toggleOutcomeAction, toggleTaskAction,
} from "@/app/(app)/actions";
import type { Idea, Task, WeeklyOutcome } from "@/db/schema";
import { formatDateAr, parseISODate } from "@/lib/time/calendar";
import { cn } from "@/lib/utils";

type Act = (form: FormData) => Promise<void>;

function HideButton({ action, id, title }: { action: Act; id: number; title: string }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-sm p-1 text-ink-4 hover:bg-surface-2 hover:text-ink"
        aria-label={`إخفاء: ${title}`}
        title="إخفاء (يبقى في النسخة الاحتياطية)"
      >
        <EyeOff className="size-3.5" aria-hidden />
      </button>
    </form>
  );
}

function DoneToggle({ action, id, title, done }: { action: Act; id: number; title: string; done: boolean }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="done" value={done ? "0" : "1"} />
      <button
        type="submit"
        aria-label={done ? `إعادة فتح: ${title}` : `تم: ${title}`}
        aria-pressed={done}
        className={cn(
          "mt-0.5 flex size-5 items-center justify-center rounded-full border transition-colors",
          done ? "border-green bg-green text-accent-ink" : "border-border-strong text-transparent hover:border-green",
        )}
      >
        <Check className="size-3" aria-hidden />
      </button>
    </form>
  );
}

export function TaskList({ items, showDate, testId }: { items: Task[]; showDate?: boolean; testId?: string }) {
  return (
    <ul className="divide-y divide-border" data-testid={testId}>
      {items.map((t) => {
        const done = t.status === "done";
        return (
          <li key={t.id} className="flex items-start gap-3 py-2.5">
            <DoneToggle action={toggleTaskAction} id={t.id} title={t.title} done={done} />
            <span className={cn("min-w-0 flex-1 text-sm", done ? "text-ink-3 line-through decoration-ink-4" : "text-ink")} dir="auto">
              {t.title}
            </span>
            {showDate && t.date ? <span className="shrink-0 text-2xs tabular-nums text-ink-3">{formatDateAr(parseISODate(t.date)!)}</span> : null}
            <HideButton action={archiveTaskAction} id={t.id} title={t.title} />
          </li>
        );
      })}
    </ul>
  );
}

export function OutcomeList({ items }: { items: WeeklyOutcome[] }) {
  return (
    <ol className="divide-y divide-border" data-testid="outcomes">
      {items.map((o) => {
        const done = o.status === "achieved";
        return (
          <li key={o.id} className="flex items-start gap-3 py-2.5">
            <DoneToggle action={toggleOutcomeAction} id={o.id} title={o.title} done={done} />
            <span className={cn("min-w-0 flex-1 text-sm", done ? "text-ink-3" : "text-ink")} dir="auto">{o.title}</span>
            {done ? <span className="shrink-0 text-2xs font-medium text-green-text">تحققت</span> : null}
            <HideButton action={archiveOutcomeAction} id={o.id} title={o.title} />
          </li>
        );
      })}
    </ol>
  );
}

export function IdeaList({ items }: { items: Idea[] }) {
  return (
    <ul className="divide-y divide-border" data-testid="ideas">
      {items.map((i) => (
        <li key={i.id} className="flex items-start gap-3 py-3">
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-ink" dir="auto">{i.title}</span>
            {i.note ? <span className="mt-0.5 block whitespace-pre-line text-xs text-ink-3" dir="auto">{i.note}</span> : null}
            <span className="mt-0.5 block text-2xs tabular-nums text-ink-4">{formatDateAr(parseISODate(i.createdAt.slice(0, 10))!)}</span>
          </span>
          <HideButton action={archiveIdeaAction} id={i.id} title={i.title} />
        </li>
      ))}
    </ul>
  );
}
