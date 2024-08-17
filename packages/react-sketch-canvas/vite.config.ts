import { defineConfig } from "vitest/config";

/// <reference types="vitest" />
export default defineConfig({
  test: {
    include: ["**/__test__/*.test.{ts,tsx}"],
    globals: true,
    environment: "jsdom",
  },
});
