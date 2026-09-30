import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { authConfigured } from "@/lib/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import { headers } from "next/headers";

export const metadata: Metadata = { title: "تسجيل الدخول" };
export const dynamic = "force-dynamic";

async function sendLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/login?error=invalid");
  const allowed = process.env.ALLOWED_EMAIL?.toLowerCase();
  // Single-user app: without ALLOWED_EMAIL nobody may sign in.
  if (!allowed) redirect("/login?error=not-configured");
  // Same message whether or not the email is allowed, so the page reveals nothing.
  if (email !== allowed) redirect("/login?sent=1");
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback`, shouldCreateUser: true },
  });
  redirect(error ? "/login?error=failed" : "/login?sent=1");
}

const ERRORS: Record<string, string> = {
  invalid: "أدخلي بريدًا إلكترونيًا صحيحًا.",
  failed: "تعذّر إرسال رابط الدخول. حاولي مرة أخرى بعد قليل.",
  "not-allowed": "هذا الحساب لا يملك صلاحية الدخول.",
  link: "انتهت صلاحية رابط الدخول. اطلبي رابطًا جديدًا.",
  "not-configured": "لم يُحدد البريد المسموح له بالدخول بعد (ALLOWED_EMAIL).",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  if (!authConfigured) redirect("/");
  const sp = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="text-base font-semibold text-ink">نظام ريم لإدارة الحياة السنوية</div>
          <div lang="en" dir="ltr" className="text-[11px] font-semibold tracking-[0.14em] text-ink-3">REEM LIFE OS</div>
        </div>
        {sp.sent ? (
          <p className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-ink-2" role="status">
            تحققي من بريدك: أرسلنا لك رابط الدخول.
          </p>
        ) : (
          <form action={sendLink} className="space-y-4 rounded-lg border border-border bg-surface p-6">
            <Field label="البريد الإلكتروني" htmlFor="email" error={sp.error ? ERRORS[sp.error] : undefined}>
              <Input id="email" name="email" type="email" autoComplete="email" dir="ltr" required aria-invalid={Boolean(sp.error)} />
            </Field>
            <Button type="submit" variant="primary" className="w-full">إرسال رابط الدخول</Button>
          </form>
        )}
      </div>
    </main>
  );
}
