import { defineConfig, devices } from "@playwright/experimental-ct-react";

export default defineConfig({
	testDir: "./tests",
	testIgnore: ["unit/**"],
	snapshotDir: "./tests/__snapshots__",
	outputDir: "./test-results",
	timeout: 10 * 1000,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [["html", { outputFolder: "playwright-report" }]],
	use: {
		trace: "on-first-retry",
		ctPort: 3100,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
	],
});
