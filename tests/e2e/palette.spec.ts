import { expect, test } from "@playwright/test";

// Reem's rule: only two colours (pink #CF6F9B, mint #7FC3A7) plus neutrals.
const PAGES = ["/", "/today", "/week/2026-10-03", "/month/2026-12", "/year/2026", "/areas", "/system", "/settings"];

for (const theme of ["dark", "light"]) {
  test(`only pink and mint hues are used (${theme})`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop");
    await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
    for (const url of PAGES) {
      await page.goto(url, { waitUntil: "networkidle" });
      const offenders = await page.evaluate(() => {
        const hueOf = (c: string) => {
          const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
          if (!m || (m[4] !== undefined && Number(m[4]) === 0)) return null;
          const [r, g, b] = [m[1], m[2], m[3]].map((v) => Number(v) / 255);
          const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
          if (d < 0.06) return null; // neutral
          let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
          h = (h * 60 + 360) % 360;
          return h;
        };
        const bad = new Set<string>();
        for (const el of Array.from(document.querySelectorAll("*"))) {
          const cs = getComputedStyle(el);
          for (const c of [cs.color, cs.backgroundColor, cs.borderTopColor, cs.fill]) {
            const h = hueOf(c);
            if (h === null) continue;
            const nearPink = Math.abs(h - 332) < 10;
            const nearMint = Math.abs(h - 155) < 10;
            if (!nearPink && !nearMint) bad.add(`${el.tagName.toLowerCase()} ${c}`);
          }
        }
        return [...bad];
      });
      expect(offenders, url).toEqual([]);
    }
  });
}
