import { expect, test } from "@playwright/test";

// Ticks and energy are shared state, so this runs on one device, in order.
test.describe.configure({ mode: "serial" });
test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "shared state; one device"));

test("daily routine: tick feeds the weekly minimum, energy hides optional items", async ({ page }) => {
  await page.goto("/today", { waitUntil: "networkidle" });
  const routine = page.getByTestId("routine");
  await expect(routine.locator("li").first()).toContainText("05:00");
  await expect(routine.locator("li").last()).toContainText("22:00");

  const english = routine.locator("li", { hasText: "إنجليزي 20 دقيقة" });
  const before = Number((await english.getByTestId("routine-counter").innerText()).match(/^(\d+)/)![1]);
  const tick = page.getByRole("button", { name: "تم: إنجليزي 20 دقيقة" });
  if (await tick.count()) await tick.click();
  else {
    await page.getByRole("button", { name: "إلغاء: إنجليزي 20 دقيقة" }).click();
    await page.getByRole("button", { name: "تم: إنجليزي 20 دقيقة" }).click();
  }
  await expect(page.getByRole("button", { name: "إلغاء: إنجليزي 20 دقيقة" })).toHaveAttribute("aria-pressed", "true");
  const after = Number((await english.getByTestId("routine-counter").innerText()).match(/^(\d+)/)![1]);
  expect(after).toBeGreaterThanOrEqual(before);
  await expect(english.getByTestId("routine-counter")).toContainText("من 3 هذا الأسبوع");

  // the same tick shows up on the week page, with no logging anywhere else
  await page.goto("/week");
  await expect(page.getByTestId("routine-progress").locator("li", { hasText: "إنجليزي" })).toContainText(`${after} من 3`);

  await page.goto("/today", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^YELLOW/ }).click();
  await expect(page.getByRole("button", { name: /^YELLOW/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("routine")).not.toContainText("قراءة شخصية");
  await expect(page.getByText(/بنود مخفية حسب طاقتك اليوم/)).toBeVisible();
  await expect(page.getByRole("navigation", { name: "أين أنا الآن" })).toContainText("YELLOW");

  await page.getByRole("button", { name: /^RED/ }).click();
  await expect(page.getByRole("button", { name: /^RED/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("routine")).not.toContainText("إنجليزي");
  await expect(page.getByTestId("routine")).toContainText("نوم");

  await page.getByRole("button", { name: /^GREEN/ }).click();
  await expect(page.getByTestId("routine")).toContainText("قراءة شخصية");
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
  await page.getByLabel("حد أدنى أسبوعي").fill("2");
  await page.getByRole("button", { name: "إضافة", exact: true }).click();
  await expect(page.getByText(`16:45 · ${title}`)).toBeVisible();

  await page.getByRole("button", { name: `تعديل: 16:45 · ${title}` }).click();
  await page.getByLabel("من").fill("16:50");
  await page.getByRole("button", { name: "حفظ" }).click();
  await expect(page.getByText(`16:50 · ${title}`)).toBeVisible();

  await page.goto("/today");
  await expect(page.getByTestId("routine")).toContainText(title);
  await page.goto("/settings/routine", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: `إخفاء: ${title}` }).click();
  await expect(page.getByText(title)).toHaveCount(0);
});
