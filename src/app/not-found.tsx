import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-ink-4">Not found</p>
        <h1 className="mt-2 font-display text-xl text-ink">This page doesn't exist</h1>
        <p className="mt-2 text-sm text-ink-3">It may have been archived, or the link is incomplete.</p>
        <Link href="/" className="mt-6 inline-flex h-9 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-ink hover:bg-accent-hover">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
