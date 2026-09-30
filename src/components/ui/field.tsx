import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-4 transition-colors focus:border-accent focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50 aria-[invalid=true]:border-red";

/** Text input. dir="auto" by default so Arabic and English both flow naturally. */
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, dir = "auto", ...props },
  ref,
) {
  return <input ref={ref} dir={dir} className={cn(control, "h-10", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, dir = "auto", ...props }, ref) {
    return <textarea ref={ref} dir={dir} className={cn(control, "min-h-24 py-2.5 leading-relaxed", className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...props },
  ref,
) {
  return <select ref={ref} className={cn(control, "h-10 pr-8", className)} {...props} />;
});

export function Field({
  label, hint, error, htmlFor, children,
}: { label: string; hint?: string; error?: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-medium text-ink-2">{label}</label>
      {children}
      {error ? (
        <p className="text-xs text-red" role="alert">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}
