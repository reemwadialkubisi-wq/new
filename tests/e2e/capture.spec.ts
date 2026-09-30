import { expect, test, type Page } from "@playwright/test";

const stamp = (info: { project: { name: string } }) => `${info.project.name}-${Date.now()}`;

async function capture(page: Page, kind: string, text: string, date?: string) {
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: /التدوين السريع/ });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("radio", { name: kind }).click();
  await dialog.locator("#capture-text").fill(text);
  if (date !== undefined) await dialog.getByLabel(/التاريخ|اليوم \(اختياري\)/).fill(date);
  await dialog.getByRole("button", { name: "دوِّني" }).click();
  await expect(dialog.getByTestId("capture-note")).toHaveText(/^حُفظ/);
  const note = await dialog.getByTestId("capture-note").innerText();
  await page.keyboard.press("Escape");
  return note;
}

test("idea goes to the Idea Inbox, with extra lines as a note, and can be hidden", async ({ page }, info) => {
  const title = `فكرة كتاب ${stamp(info)}`;
  await page.goto("/");
  expect(await capture(page, "فكرة", `${title}\nعن القيادة الهادئة`)).toMatch(/صندوق الأفكار/);
  await page.goto("/ideas");
  const item = page.getByTestId("ideas").locator("li", { hasText: title });
  await expect(item).toContainText("عن القيادة الهادئة");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: `إخفاء: ${title}` }).click();
  await expect(page.getByText(title)).toHaveCount(0);
});

test("task goes to Today, can be marked done and survives reload", async ({ page }, info) => {
  const title = `مهمة ${stamp(info)}`;
  await page.goto("/today");
  expect(await capture(page, "مهمة", title)).toMatch(/حُفظت مهمة ليوم/);
  const list = page.getByTestId("tasks-today");
  await expect(list).toContainText(title);
  await page.getByRole("button", { name: `تم: ${title}` }).click();
  await expect(page.getByRole("button", { name: `إعادة فتح: ${title}` })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByRole("button", { name: `إعادة فتح: ${title}` })).toBeVisible();
});

test("task without a date waits on Today under «بلا تاريخ»", async ({ page }, info) => {
  const title = `بلا تاريخ ${stamp(info)}`;
  await page.goto("/today");
  expect(await capture(page, "مهمة", title, "")).toMatch(/بلا تاريخ/);
  await expect(page.getByTestId("tasks-undated")).toContainText(title);
});

test("outcome goes to this week's Weekly Outcomes", async ({ page }, info) => {
  const title = `نتيجة ${stamp(info)}`;
  await page.goto("/week");
  expect(await capture(page, "نتيجة", title)).toMatch(/نتائج هذا الأسبوع|قد يتجاوز الحمل/);
  await expect(page.getByTestId("outcomes")).toContainText(title);
  await page.getByRole("button", { name: `تم: ${title}` }).click();
  await expect(page.getByTestId("outcomes").locator("li", { hasText: title })).toContainText("تحققت");
});

test("date goes to Important Dates and shows on its month", async ({ page }, info) => {
  const title = `موعد ${stamp(info)}`;
  await page.goto("/");
  expect(await capture(page, "موعد", title, "2030-03-14")).toMatch(/14 مارس/);
  await page.goto("/month/2030-03");
  await expect(page.getByTestId("events")).toContainText(title);
});

test("date type needs a date", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: /التدوين السريع/ });
  await dialog.getByRole("radio", { name: "موعد" }).click();
  await dialog.locator("#capture-text").fill("بلا تاريخ");
  await dialog.getByLabel("التاريخ").fill("");
  await dialog.getByRole("button", { name: "دوِّني" }).click();
  await expect(dialog.getByTestId("capture-note")).toHaveText("اختاري التاريخ.");
});
