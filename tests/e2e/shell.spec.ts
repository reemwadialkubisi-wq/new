import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

test.describe("every route renders a designed page", () => {
  for (const route of ROUTES) {
    test(`${route}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(page.getByRole("navigation", { name: "Current period" })).toBeVisible();
      // no horizontal page scroll at any size
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }
});

test("no broken internal links anywhere", async ({ page, request }, info) => {
  test.skip(info.project.name !== "desktop");
  const seen = new Set<string>();
  for (const route of ROUTES) {
    await page.goto(route);
    const hrefs = await page.locator("a[href^='/']").evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
    hrefs.forEach((h) => seen.add(h));
  }
  for (const href of seen) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
  }
  expect(seen.size).toBeGreaterThan(30);
});

test("invalid periods and unknown ids show the designed not-found page", async ({ page }) => {
  for (const url of ["/week/2026-02-30", "/month/2026-13", "/quarter/2026-q5", "/year/abc", "/areas/nope", "/goals/123", "/tasks"]) {
    const res = await page.goto(url);
    expect(res?.status(), url).toBe(404);
    await expect(page.getByText("This page doesn't exist")).toBeVisible();
  }
});

test("calendar: weeks start Saturday, 4-day rule, bridge week", async ({ page }) => {
  await page.goto("/week/2026-10-01");
  await expect(page).toHaveURL(/\/week\/2026-09-26$/);
  await expect(page.locator("main h1")).toContainText("Week 39");
  await expect(page.getByText("Bridge week between Q3 and Q4")).toBeVisible();
  await page.goto("/month/2026-12");
  await expect(page.getByRole("main").getByRole("link", { name: /^W\d+/ })).toHaveCount(5);
  await expect(page.getByRole("link", { name: /W52.*26 Dec–1 Jan/ })).toBeVisible();
  await page.goto("/month/2026-10");
  await expect(page.getByRole("main").getByRole("link", { name: /^W\d+/ })).toHaveText([/W40.*3–9 Oct/, /W41/, /W42/, /W43.*24–30 Oct/]);
});

test("knowledge and assets have one home only", async ({ page }) => {
  await page.goto("/areas/knowledge");
  await expect(page).toHaveURL(/\/knowledge$/);
  await page.goto("/areas/assets");
  await expect(page).toHaveURL(/\/assets$/);
});

test("Quick Capture opens with Ctrl+K, validates, and closes with Escape", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" }); // shortcut listens once the page is interactive
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Quick Capture" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "Idea" })).toHaveAttribute("aria-checked", "true");
  await expect(dialog.getByRole("textbox")).toBeFocused();
  await expect(dialog.getByRole("textbox")).toHaveAttribute("dir", "auto");
  await dialog.getByRole("button", { name: "Capture" }).click();
  await expect(dialog.getByText("Write a few words first.")).toBeVisible();
  await dialog.getByRole("textbox").fill("فكرة كتاب عن القيادة");
  await dialog.getByRole("radio", { name: "Task" }).click();
  await dialog.getByRole("button", { name: "Capture" }).click();
  await expect(dialog.getByText(/Captured in this preview only/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("dark night theme is the default", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("dark mode switches and persists", async ({ page }, info) => {
  await page.goto("/settings");
  await page.getByRole("main").getByRole("radio", { name: "Light" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.getByRole("main").getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(17, 17, 17)");
  await page.getByRole("main").getByRole("radio", { name: "Light" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});
