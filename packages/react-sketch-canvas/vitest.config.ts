import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["tests/unit/**/*.spec.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
    },
  },
});
