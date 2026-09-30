import { expect, test } from "@playwright/test";

test("desktop: sidebar groups collapse and remember, rail mode remembers", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop");
  await page.goto("/");
  const sidebar = page.locator("aside").first();
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveCSS("width", "248px");
  const growth = sidebar.getByRole("button", { name: "Growth" });
  await expect(growth).toHaveAttribute("aria-expanded", "true");
  await growth.click();
  await expect(growth).toHaveAttribute("aria-expanded", "false");
  await expect(sidebar.getByRole("link", { name: "English" })).toHaveCount(0);
  await page.reload();
  await expect(sidebar.getByRole("button", { name: "Growth" })).toHaveAttribute("aria-expanded", "false");
  // A group holding the current page always opens
  await page.goto("/areas/english");
  await expect(sidebar.getByRole("link", { name: "English" })).toHaveAttribute("aria-current", "page");

  await sidebar.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(sidebar).toHaveCSS("width", "72px");
  await page.reload();
  await expect(page.locator("aside").first()).toHaveCSS("width", "72px");
  await page.locator("aside").first().getByRole("button", { name: "Expand sidebar" }).click();
});

test("desktop: time bar shows where I am and every part is a link", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop");
  await page.goto("/");
  const bar = page.getByRole("navigation", { name: "Current period" });
  await expect(bar.getByRole("link")).toHaveCount(6);
  await bar.getByRole("link", { name: /^Q\d/ }).click();
  await expect(page).toHaveURL(/\/quarter\/\d{4}-q\d$/);
  await bar.getByRole("link", { name: /^W\d+/ }).click();
  await expect(page).toHaveURL(/\/week\/\d{4}-\d{2}-\d{2}$/);
});

test("tablet and phone: sidebar becomes a drawer", async ({ page }, info) => {
  test.skip(info.project.name === "desktop");
  await page.goto("/");
  await expect(page.locator("aside").first()).toBeHidden();
  await page.getByRole("button", { name: "Open menu" }).click();
  const drawer = page.getByRole("dialog", { name: "Menu" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(drawer).toBeHidden();
});

test("phone: bottom bar with Home, Today, Week, Capture", async ({ page }, info) => {
  test.skip(info.project.name !== "phone");
  await page.goto("/");
  const bar = page.getByRole("navigation", { name: "Quick navigation" });
  await expect(bar).toBeVisible();
  await bar.getByRole("link", { name: "Today" }).click();
  await expect(page).toHaveURL(/\/today$/);
  await bar.getByRole("button", { name: "Capture" }).click();
  await expect(page.getByRole("dialog", { name: "Quick Capture" })).toBeVisible();
});

test("tablet: no bottom bar", async ({ page }, info) => {
  test.skip(info.project.name !== "tablet");
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Quick navigation" })).toBeHidden();
});

test("desktop: the whole sidebar fits a 1440×900 screen without scrolling", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop");
  await page.goto("/");
  const reviews = page.locator("aside").first().getByRole("link", { name: "Reviews" });
  const box = await reviews.boundingBox();
  expect(box && box.y + box.height).toBeLessThanOrEqual(900);
  await expect(reviews).toBeInViewport({ ratio: 1 });
  const scroller = page.locator("aside").first().locator("nav[aria-label=Main]").locator("..");
  expect(await scroller.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(0);
  const settings = await page.locator("aside").first().getByRole("link", { name: /Settings/ }).boundingBox();
  expect(settings && settings.y + settings.height).toBeLessThanOrEqual(900);
});

test("time bar toggle switches light and dark", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Switch to (dark|light) mode/ }).click();
  const first = await page.locator("html").getAttribute("class");
  await page.getByRole("button", { name: /Switch to (dark|light) mode/ }).click();
  expect(await page.locator("html").getAttribute("class")).not.toBe(first);
});
