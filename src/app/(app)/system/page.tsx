import type { Metadata } from "next";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { EnergyChip, Kbd, Progress, SignalDot, StatusBadge, TierBadge } from "@/components/ui/status";

export const metadata: Metadata = { title: "نظام التصميم" };

const COLORS = [
  ["bg", "الخلفية"], ["surface", "السطح"], ["surface-2", "سطح 2"], ["border", "الحدود"],
  ["ink", "النص"], ["ink-2", "نص 2"], ["ink-3", "نص 3"], ["pink", "وردي #CF6F9B"],
  ["mint", "نعناعي #7FC3A7"], ["accent-soft", "وردي خفيف"], ["green-soft", "نعناعي خفيف"], ["surface-3", "سطح 3"],
];

export default function SystemPage() {
  return (
    <>
      <PageHeader eyebrow="الإعدادات" title="نظام التصميم" english="Design System" subtitle="المصدر الوحيد لكل الصفحات: الألوان والخطوط والمكونات." />
      <div className="space-y-6">
        <Section title="الألوان" meta="بدّلي المظهر للمقارنة بين الفاتح والداكن">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {COLORS.map(([token, label]) => (
              <li key={token}>
                <div className="h-14 rounded-md border border-border" style={{ background: `var(--${token})` }} />
                <div className="mt-1.5 text-xs text-ink-2">{label}</div>
                <div dir="ltr" className="text-end text-2xs text-ink-4">--{token}</div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="الخطوط" meta="IBM Plex Sans Arabic · IBM Plex Sans · Newsreader">
          <div className="space-y-4">
            <p className="font-display text-2xl">أين أنا الآن، وما المهم؟</p>
            <p className="font-display text-xl">Q4 · إعادة ضبط، تصميم، استعداد</p>
            <p className="text-lg font-medium">عنوان قسم 20</p>
            <p className="text-base">نص 16. النجاح هو التقدم المستدام، وليس الإنجاز الكامل.</p>
            <p className="text-sm text-ink-2">نص 14 (الواجهة). الأسبوع 40 · 3–9 أكتوبر 2026 · 90 قراءة</p>
            <p lang="en" dir="ltr" className="font-display text-lg">Where am I, and what matters now? · Big 3 · Weekly Review</p>
          </div>
        </Section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section title="الأزرار">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">أساسي</Button>
              <Button>ثانوي</Button>
              <Button variant="ghost">خفيف</Button>
              <Button variant="quiet">رابط هادئ</Button>
              <Button variant="primary" disabled>غير متاح</Button>
              <Button size="sm">صغير</Button>
            </div>
          </Section>
          <Section title="الحالات والإشارات">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2"><EnergyChip level="GREEN" /><EnergyChip level="YELLOW" /><EnergyChip level="RED" /><EnergyChip level={null} /></div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="active" /><StatusBadge status="planned" /><StatusBadge status="paused" />
                <StatusBadge status="incubating" /><StatusBadge status="completed" /><StatusBadge status="archived" />
              </div>
              <div className="flex flex-wrap gap-2"><TierBadge tier="must" /><TierBadge tier="should" /><TierBadge tier="could" /></div>
              <div className="flex flex-wrap gap-5"><SignalDot signal="on-track" /><SignalDot signal="needs-attention" /><SignalDot signal="resting" /></div>
              <Progress value={62} label="مثال على التقدم" />
              <div dir="ltr" className="flex justify-end gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></div>
            </div>
          </Section>
          <Section title="النماذج">
            <div className="space-y-4">
              <Field label="نتيجة أسبوعية" htmlFor="ds-outcome" hint="نتيجة وليست مهمة. بالعربية أو الإنجليزية.">
                <Input id="ds-outcome" placeholder="حصر متطلبات الرخص الثلاث" />
              </Field>
              <Field label="عنوان الشهر" htmlFor="ds-theme" error="اجعلي العنوان أقل من 40 حرفًا.">
                <Input id="ds-theme" aria-invalid defaultValue="إعادة ضبط الإيقاع اليومي وبناء الأساس للربع القادم" />
              </Field>
              <Field label="مجال الحياة" htmlFor="ds-area">
                <Select id="ds-area" defaultValue="phd"><option value="phd">الدكتوراه والمسار الأكاديمي</option><option value="family">الأسرة</option></Select>
              </Field>
              <Field label="ملاحظة" htmlFor="ds-note"><Textarea id="ds-note" placeholder="…" /></Field>
            </div>
          </Section>
          <Section title="الحالة الفارغة">
            <EmptyState icon={Target} title="لا توجد نتائج لهذا الأسبوع" phase={3}>
              هادئة ومفيدة: تشرح ما سيظهر هنا، ولا تقول أبدًا «لم يُنجز شيء».
            </EmptyState>
          </Section>
        </div>

        <Card className="p-6">
          <p className="text-xs font-semibold text-ink-3">التخطيط العام</p>
          <p className="mt-2 text-sm text-ink-2">
            اتجاه من اليمين لليسار · القائمة الجانبية على اليمين 248px (72px عند الطي) · المحتوى حتى 1200px · شبكة 12 عمودًا، 8 / 4 ·
            مسافات على مقياس 4px · هوامش 40px للحاسوب و16px للجوال · نقاط التحول 768 / 1024.
          </p>
        </Card>
      </div>
    </>
  );
}
