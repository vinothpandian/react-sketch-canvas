import { defineConfig, devices } from "playwright/test";

export default defineConfig({
	testDir: "./playwright/e2e",
	outputDir: "./test-results/e2e",
	timeout: 10 * 1000,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [["html", { outputFolder: "playwright-report/e2e" }]],
	use: {
		baseURL: "http://127.0.0.1:3200",
		trace: "on-first-retry",
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
	webServer: {
		command: "pnpm exec vite playwright/e2e --host 127.0.0.1 --port 3200",
		url: "http://127.0.0.1:3200",
		reuseExistingServer: !process.env.CI,
	},
});
