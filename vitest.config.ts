import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Server-only guard is for the Next.js bundler; tests run the same code in Node.
      "server-only": path.resolve(__dirname, "src/test/empty.ts"),
    },
  },
  test: { include: ["src/**/*.test.ts"], env: { DATABASE_PATH: ":memory:" } },
});
