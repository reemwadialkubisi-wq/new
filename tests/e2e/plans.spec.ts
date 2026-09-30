import { expect, test, type Page } from "@playwright/test";

// Each device project writes to its own future year so parallel runs never collide.
const YEAR: Record<string, number> = { desktop: 2031, tablet: 2032, phone: 2033 };
const yearFor = (name: string) => YEAR[name] ?? 2034;

async function openEditor(page: Page, section: RegExp) {
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: section }).click();
}

test("the Q4 2026 plan is there from the start", async ({ page }) => {
  await page.goto("/quarter/2026-q4");
  await expect(page.getByTestId("plan-theme")).toContainText("Reset · Design · Prepare");
  await expect(page.getByTestId("plan-priorities").locator("li")).toHaveCount(4);
  await expect(page.getByTestId("months")).toContainText("إعادة ضبط · Reset");
  await expect(page.getByTestId("area-focus")).toContainText("سورة البقرة");
  await page.goto("/month/2026-10");
  await expect(page.locator("main h1 + *, main header").first()).toBeVisible();
  await expect(page.getByTestId("events")).toContainText("آخر موعد لإغلاق الملفات الثلاثة");
  await expect(page.getByTestId("events")).toContainText("31 أكتوبر");
  await page.goto("/year/2026");
  await expect(page.getByTestId("quarters")).toContainText("إعادة ضبط");
});

test("year plan: write, save, persists after reload", async ({ page }, info) => {
  const y = yearFor(info.project.name);
  await page.goto(`/year/${y}`);
  await openEditor(page, /تعديل: الرؤية والاتجاه/);
  await page.getByLabel("عنوان السنة · Theme").fill(`سنة البناء ${y}`);
  await page.getByLabel("الرؤية والاتجاه · Vision").last().fill("تقدم هادئ ومستدام");
  await page.getByLabel("أولويات السنة · Top Priorities 1").fill("الدكتوراه");
  await page.getByLabel("أولويات السنة · Top Priorities 2").fill("الصحة");
  await page.getByLabel("الحالة").selectOption("active");
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByTestId("plan-theme")).toHaveText(`سنة البناء ${y}`);
  await page.reload();
  await expect(page.getByTestId("plan-theme")).toHaveText(`سنة البناء ${y}`);
  await expect(page.getByTestId("plan-priorities").locator("li")).toHaveText([/الدكتوراه/, /الصحة/]);
  await expect(page.getByTestId("plan-status")).toHaveText("نشط");
  await expect(page.locator("main header, main").first()).toContainText(`سنة البناء ${y}`);
  // a planned future year appears in the year selector
  await expect(page.getByRole("navigation", { name: "السنوات" }).getByRole("link", { name: String(y) })).toBeVisible();
});

test("forms show errors and keep what was typed", async ({ page }, info) => {
  const y = yearFor(info.project.name);
  await page.goto(`/quarter/${y}-q2`);
  await openEditor(page, /تعديل: خطة الربع/);
  const long = "ط".repeat(100);
  await page.getByLabel("عنوان الربع · Theme").fill(long);
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByText("النص أطول من اللازم (الحد 80 حرفًا).")).toBeVisible();
  await expect(page.getByLabel("عنوان الربع · Theme")).toHaveValue(long);
  await expect(page.getByLabel("عنوان الربع · Theme")).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("عنوان الربع · Theme").fill("ربع التركيز");
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByTestId("plan-theme")).toHaveText("ربع التركيز");
});

test("month outcomes flow up to the quarter page", async ({ page }, info) => {
  const y = yearFor(info.project.name);
  await page.goto(`/month/${y}-05`);
  await openEditor(page, /تعديل: خطة الشهر/);
  await page.getByLabel("عنوان الشهر · Theme").fill("شهر الكتابة");
  await page.getByLabel("أهم النتائج · Top Outcomes 1").fill("مسودة الفصل الثاني");
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByTestId("plan-priorities")).toContainText("مسودة الفصل الثاني");
  await expect(page.locator("main")).toContainText("شهر الكتابة");
  await page.goto(`/quarter/${y}-q2`);
  await expect(page.getByTestId("months")).toContainText("شهر الكتابة");
});

test("area focus: set, then shown by tier", async ({ page }, info) => {
  const y = yearFor(info.project.name);
  await page.goto(`/month/${y}-06`);
  await openEditor(page, /تعديل: تركيز المجالات/);
  await page.locator("#focus_health").fill("نوم مبكر");
  await page.getByLabel("أولوية الصحة والطاقة").selectOption("must");
  await page.locator("#focus_english").fill("3 × 20 دقيقة");
  await page.getByRole("button", { name: "حفظ" }).click();
  const list = page.getByTestId("area-focus");
  await expect(list.locator("li").first()).toContainText("الصحة والطاقة");
  await expect(list).toContainText("3 × 20 دقيقة");
  await page.reload();
  await expect(page.getByTestId("area-focus")).toContainText("نوم مبكر");
});

test("important dates: validate, add, show on month and year, hide", async ({ page }, info) => {
  const y = yearFor(info.project.name);
  const title = `تسليم التقرير ${Date.now()}`;
  await page.goto(`/month/${y}-07`);
  await openEditor(page, /إضافة: تواريخ مهمة/);
  await page.getByRole("button", { name: "إضافة" }).click();
  await expect(page.getByText("اكتبي عنوانًا قصيرًا.")).toBeVisible();
  await page.getByLabel("العنوان").fill(title);
  await page.getByLabel("التاريخ", { exact: true }).fill(`${y}-07-15`);
  await page.getByLabel("حتى (اختياري)").fill(`${y}-07-10`);
  await page.getByRole("button", { name: "إضافة" }).click();
  await expect(page.getByText("تاريخ النهاية يجب أن يكون بعد البداية أو في اليوم نفسه.")).toBeVisible();
  await page.getByLabel("حتى (اختياري)").fill("");
  await page.getByLabel("النوع").selectOption("deadline");
  await page.getByRole("button", { name: "إضافة" }).click();
  const events = page.getByTestId("events");
  await expect(events).toContainText(title);
  await expect(events).toContainText("15 يوليو");
  await page.goto(`/year/${y}`);
  await expect(page.getByTestId("events")).toContainText(title);
  await page.goto(`/month/${y}-07`);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: `إخفاء: ${title}` }).click();
  await expect(page.getByText(title)).toHaveCount(0);
});

test("the system starts with Q4 2026: nothing earlier is shown", async ({ page }) => {
  for (const [from, to] of [
    ["/year/2025", /\/year\/2026$/],
    ["/quarter/2026-q3", /\/quarter\/2026-q4$/],
    ["/quarter/2025-q1", /\/quarter\/2026-q4$/],
    ["/month/2026-09", /\/month\/2026-10$/],
    ["/week/2026-09-12", /\/week\/2026-09-26$/],
  ] as const) {
    await page.goto(from);
    await expect(page, from).toHaveURL(to);
  }
  await page.goto("/year/2026");
  const years = page.getByRole("navigation", { name: "السنوات" });
  await expect(years.getByRole("link", { name: /2025/ })).toHaveCount(0);
  await expect(years.getByRole("link").first()).toHaveText("2026");
  await expect(page.getByTestId("quarters").getByRole("link")).toHaveCount(1);
  await expect(page.getByTestId("quarters")).toContainText("قبل بداية النظام");
  await expect(page.getByRole("link", { name: "الفترة السابقة" })).toHaveCount(0);
  await page.goto("/quarter/2026-q4");
  await expect(page.getByRole("link", { name: "الفترة السابقة" })).toHaveCount(0);
  await page.goto("/month/2026-10");
  await expect(page.getByRole("link", { name: "الفترة السابقة" })).toHaveCount(0);
  await page.goto("/month/2026-11");
  await expect(page.getByRole("link", { name: "الفترة السابقة" })).toHaveAttribute("href", "/month/2026-10");
});

test("settings: validation and saving", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "settings are shared; one device is enough");
  await page.goto("/settings");
  await openEditor(page, /تعديل: التقويم والسعة/);
  await page.getByLabel("المنطقة الزمنية").fill("Mars/Olympus");
  await page.getByLabel("نتائج الأسبوع").fill("6");
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByText("منطقة زمنية غير معروفة. مثال: Asia/Riyadh")).toBeVisible();
  await page.getByLabel("المنطقة الزمنية").fill("Asia/Riyadh");
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByTestId("setting-نتائج الأسبوع")).toHaveText("≤ 6");
  await openEditor(page, /تعديل: التقويم والسعة/);
  await page.getByLabel("نتائج الأسبوع").fill("5");
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByTestId("setting-نتائج الأسبوع")).toHaveText("≤ 5");
});

test("backup downloads everything as JSON", async ({ request }) => {
  const res = await request.get("/api/backup");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-disposition"]).toMatch(/reem-life-os-backup-\d{4}-\d{2}-\d{2}\.json/);
  const data = await res.json();
  expect(data.periodPlans.some((p: { key: string }) => p.key === "2026-q4")).toBe(true);
  expect(Array.isArray(data.events)).toBe(true);
});

test("at 1024px the side-column date form fits its card", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop");
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto("/month/2026-11");
  await openEditor(page, /إضافة: تواريخ مهمة/);
  const card = page.getByLabel("التاريخ", { exact: true }).locator("xpath=ancestor::div[contains(@class,'@container')][1]");
  const cardBox = (await card.boundingBox())!;
  for (const label of ["التاريخ", "حتى (اختياري)", "النوع"]) {
    const box = (await page.getByLabel(label, { exact: true }).boundingBox())!;
    expect(box.width, label).toBeGreaterThan(150);
    expect(box.x, label).toBeGreaterThanOrEqual(cardBox.x);
    expect(box.x + box.width, label).toBeLessThanOrEqual(cardBox.x + cardBox.width);
  }
});
