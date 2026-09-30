"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[60dvh] items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-xl text-ink">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-3">Nothing you did caused this. Try again.</p>
        <button onClick={reset} className="mt-6 inline-flex h-9 items-center rounded-md border border-border-strong bg-surface px-4 text-sm hover:bg-surface-2">
          Try again
        </button>
      </div>
    </main>
  );
}
