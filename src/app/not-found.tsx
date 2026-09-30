import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <p className="text-xs font-semibold text-ink-4">غير موجودة</p>
        <h1 className="mt-2 font-display text-xl text-ink">هذه الصفحة غير موجودة</h1>
        <p className="mt-2 text-sm text-ink-3">ربما أُرشفت، أو الرابط غير مكتمل.</p>
        <Link href="/" className="mt-6 inline-flex h-9 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-ink hover:bg-accent-hover">
          العودة إلى الرئيسية
        </Link>
      </div>
    </main>
  );
}
