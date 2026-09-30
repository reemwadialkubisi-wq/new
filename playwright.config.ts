import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "off" },
  webServer: process.env.PW_NO_SERVER
    ? undefined
    : {
        command: `npx next start -p ${PORT}`,
        port: PORT,
        reuseExistingServer: true,
        // A separate database so tests never touch real data.
        env: { DATABASE_PATH: "test-results/e2e.db" },
      },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 834, height: 1112 }, hasTouch: true } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
});
