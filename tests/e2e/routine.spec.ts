import { expect, test } from "@playwright/test";

// Ticks and energy are shared state, so this runs on one device, in order.
test.describe.configure({ mode: "serial" });
test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "shared state; one device"));

const num = (t: string, re: RegExp) => Number(t.match(re)![1]);

test("daily routine: ticks feed habits, the knowledge slot counts toward the pick, energy hides optional items", async ({ page }) => {
  await page.goto("/today", { waitUntil: "networkidle" });
  const routine = page.getByTestId("routine");
  await expect(routine.locator("li").first()).toContainText("05:00");
  await expect(routine.locator("li").last()).toContainText("22:00");

  // the evening walk counts toward movement
  const walk = routine.locator("li", { hasText: "حركة أو مشي عند القدرة" });
  const before = num(await walk.getByTestId("routine-counter").innerText(), /حركة: (\d+)/);
  const untick = page.getByRole("button", { name: "إلغاء: حركة أو مشي عند القدرة" });
  if (await untick.count()) {
    await untick.click();
    await expect(page.getByRole("button", { name: "تم: حركة أو مشي عند القدرة" })).toBeVisible();
  }
  const base = num(await walk.getByTestId("routine-counter").innerText(), /حركة: (\d+)/);
  expect(base).toBeLessThanOrEqual(before);
  await page.getByRole("button", { name: "تم: حركة أو مشي عند القدرة" }).click();
  await expect(page.getByRole("button", { name: "إلغاء: حركة أو مشي عند القدرة" })).toHaveAttribute("aria-pressed", "true");
  await expect(walk.getByTestId("routine-counter")).toContainText(`حركة: ${base + 1} من 3 هذا الأسبوع`);

  // one knowledge goal: pick English, then change to PhD
  const slot = routine.locator("li", { hasText: "هدف معرفي واحد فقط" });
  for (const name of ["إلغاء: إنجليزي", "إلغاء: الدكتوراه", "إلغاء: معرفة تخصصية"]) {
    const b = slot.getByRole("button", { name });
    if (await b.count()) await b.click();
  }
  await expect(slot.getByRole("button", { name: "تم: إنجليزي" })).toBeVisible();
  const englishBefore = num(await slot.getByRole("button", { name: "تم: إنجليزي" }).innerText(), /(\d+)\/3/);
  await slot.getByRole("button", { name: "تم: إنجليزي" }).click();
  await expect(slot.getByRole("button", { name: "إلغاء: إنجليزي" })).toHaveAttribute("aria-pressed", "true");
  await expect(slot.getByRole("button", { name: "إلغاء: إنجليزي" })).toContainText(`${englishBefore + 1}/3`);

  // the same ticks show up on the week page, with nothing else to log
  await page.goto("/week");
  const progress = page.getByTestId("routine-progress");
  await expect(progress.locator("li", { hasText: "إنجليزي" })).toContainText(`${englishBefore + 1} من 3`);
  await expect(progress.locator("li", { hasText: /^حركة/ })).toContainText(`${base + 1} من 3`);

  await page.goto("/today", { waitUntil: "networkidle" });
  await page.getByTestId("routine").locator("li", { hasText: "هدف معرفي واحد فقط" }).getByRole("button", { name: "تم: الدكتوراه" }).click();
  await expect(page.getByRole("button", { name: "إلغاء: الدكتوراه" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "تم: إنجليزي" })).toContainText(`${englishBefore}/3`);

  // each tick also lands in its life area
  await page.goto("/areas/phd");
  await expect(page.getByTestId("area-ticks")).toContainText("هدف معرفي واحد فقط: الدكتوراه");
  await page.goto("/areas/health");
  await expect(page.getByTestId("routine-progress").locator("li", { hasText: /^حركة/ })).toContainText(`${base + 1} من 3`);
  await page.goto("/today", { waitUntil: "networkidle" });

  // energy
  await page.getByRole("button", { name: /^YELLOW/ }).click();
  await expect(page.getByRole("button", { name: /^YELLOW/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("routine")).not.toContainText("مسلسل");
  await expect(page.getByText(/بنود مخفية حسب طاقتك اليوم/)).toBeVisible();
  await expect(page.getByRole("navigation", { name: "أين أنا الآن" })).toContainText("YELLOW");
  await page.getByRole("button", { name: /^RED/ }).click();
  await expect(page.getByRole("button", { name: /^RED/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("routine")).not.toContainText("هدف معرفي");
  await expect(page.getByTestId("routine")).toContainText("نوم");
  await page.getByRole("button", { name: /^GREEN/ }).click();
  await expect(page.getByTestId("routine")).toContainText("مسلسل");
});

test("routine editor: add, validate, edit and hide an item", async ({ page }) => {
  const title = `مشي مع الأطفال ${Date.now()}`;
  await page.goto("/settings/routine", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "إضافة: إضافة بند" }).click();
  await page.getByLabel("البند").fill(title);
  await page.getByRole("button", { name: "إضافة", exact: true }).click();
  await expect(page.getByText("اكتبي الوقت بصيغة 05:30.")).toBeVisible();
  await expect(page.getByLabel("البند")).toHaveValue(title);
  await page.getByLabel("من").fill("16:45");
  await page.getByLabel("يُحسب في مجال").selectOption("family");
  await page.getByLabel("كل ✓ يُحسب أيضًا في").selectOption({ label: "حركة" });
  await page.getByRole("button", { name: "إضافة", exact: true }).click();
  await expect(page.getByText(`16:45 · ${title}`)).toBeVisible();

  await page.getByRole("button", { name: `تعديل: 16:45 · ${title}` }).click();
  await page.getByLabel("من").fill("16:50");
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByText(`16:50 · ${title}`)).toBeVisible();

  await expect(page.getByText(`${"من الأحد"}`).first()).toBeVisible();
  await expect(page.getByText(/يُحسب في حركة/).first()).toBeVisible();
  await page.goto("/today");
  await expect(page.getByTestId("routine").locator("li", { hasText: title })).toContainText("حركة:");
  await page.goto("/settings/routine", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: `إخفاء: ${title}` }).click();
  await expect(page.getByText(title)).toHaveCount(0);
});
