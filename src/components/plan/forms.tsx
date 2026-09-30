"use client";

import { Pencil, X } from "lucide-react";
import { cloneElement, createContext, isValidElement, startTransition, useActionState, useContext, useEffect, useRef, useState } from "react";
import type { FormState } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Action = (prev: FormState, form: FormData) => Promise<FormState>;

const ErrorsContext = createContext<Record<string, string>>({});
const EditContext = createContext<{ close: () => void } | null>(null);

/**
 * A form that posts to a server action and keeps what was typed when there are errors
 * (React would otherwise reset the fields). Closes the surrounding EditableSection on success.
 */
export function ActionForm({
  action, children, submitLabel = "حفظ", className, resetOnSave, onCancel,
}: {
  action: Action;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  resetOnSave?: boolean;
  onCancel?: () => void;
}) {
  const [state, run, pending] = useActionState(action, {});
  const edit = useContext(EditContext);
  const ref = useRef<HTMLFormElement>(null);
  const cancel = onCancel ?? edit?.close;

  useEffect(() => {
    if (!state.savedAt) return;
    if (resetOnSave) ref.current?.reset();
    edit?.close();
  }, [state.savedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ErrorsContext.Provider value={state.errors ?? {}}>
      <form
        ref={ref}
        method="post"
        noValidate
        className={cn("space-y-4", className)}
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(() => run(data));
        }}
      >
        {children}
        {state.errors?.form ? <p role="alert" className="text-xs text-red-text">{state.errors.form}</p> : null}
        {state.errors && Object.keys(state.errors).length ? (
          <p role="status" className="sr-only">لم يُحفظ. راجعي الحقول المشار إليها.</p>
        ) : null}
        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "جارٍ الحفظ…" : submitLabel}
          </Button>
          {cancel ? (
            <Button type="button" variant="ghost" onClick={cancel}>
              إلغاء
            </Button>
          ) : null}
        </div>
      </form>
    </ErrorsContext.Provider>
  );
}

/** Label + control + the field's error (from the surrounding ActionForm). */
export function FormField({
  name, label, hint, children, className,
}: { name: string; label: string; hint?: string; children: React.ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>; className?: string }) {
  const error = useContext(ErrorsContext)[name];
  const id = `f-${name}`;
  const control = isValidElement(children)
    ? cloneElement(children, { id, "aria-invalid": error ? true : undefined, "aria-describedby": error || hint ? `${id}-note` : undefined })
    : children;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-xs font-medium text-ink-2">{label}</label>
      {control}
      {error ? (
        <p id={`${id}-note`} className="text-xs text-red-text" role="alert">{error}</p>
      ) : hint ? (
        <p id={`${id}-note`} className="text-xs text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

export function FieldError({ name }: { name: string }) {
  const error = useContext(ErrorsContext)[name];
  return error ? <p className="text-xs text-red-text" role="alert">{error}</p> : null;
}

/** A card that shows its content, with an Edit button that swaps in a form. */
export function EditableSection({
  title, meta, view, form, editLabel = "تعديل", className, readOnly,
}: {
  title: string;
  meta?: React.ReactNode;
  view: React.ReactNode;
  form: React.ReactNode;
  editLabel?: string;
  className?: string;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  // Until the page is interactive the button can't open the form; show it as not ready yet.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <Card className={cn("@container p-6", className)}>
      <SectionTitle
        meta={
          <span className="flex items-center gap-3">
            {meta}
            {readOnly ? null : editing ? (
              <button type="button" onClick={() => setEditing(false)} className="inline-flex items-center gap-1 text-ink-3 hover:text-ink">
                <X className="size-3.5" aria-hidden /> إغلاق
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                disabled={!ready}
                className="inline-flex items-center gap-1 font-medium text-accent-text hover:underline disabled:opacity-40"
                aria-label={`${editLabel}: ${title}`}
              >
                <Pencil className="size-3.5" aria-hidden /> {editLabel}
              </button>
            )}
          </span>
        }
      >
        {title}
      </SectionTitle>
      <div className="mt-4">
        {editing ? <EditContext.Provider value={{ close: () => setEditing(false) }}>{form}</EditContext.Provider> : view}
      </div>
    </Card>
  );
}
