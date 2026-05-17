import { expect, test } from "playwright/test";
import { drawLine } from "../../tests/commands";

test("draws, exports, and clears on the browser harness", async ({ page }) => {
	await page.goto("/");

	const canvas = page.locator("#rsc");
	await expect(canvas).toBeVisible();

	await drawLine(canvas, { length: 80, originX: 20, originY: 20 });

	await expect(canvas.locator("path")).toHaveCount(1);
	await expect(page.locator("#path-count")).toHaveText("1");

	await page.locator("#export-image-button").click();
	await expect(page.locator("#exported-image")).toHaveText(
		/^data:image\/png;base64,/,
	);

	await page.locator("#clear-button").click();
	await expect(page.locator("#path-count")).toHaveText("0");
	await expect(canvas.locator("path")).toHaveCount(0);
});

test("supports eraser mode with undo and redo controls", async ({ page }) => {
	await page.goto("/");

	const canvas = page.locator("#rsc");

	await drawLine(canvas, { length: 80, originX: 20, originY: 20 });
	await page.locator("#eraser-button").click();
	await drawLine(canvas, { length: 30, originX: 20, originY: 20 });

	await expect(page.locator("#path-count")).toHaveText("2");
	await expect(canvas.locator("#rsc__eraser-stroke-group path")).toHaveCount(1);

	await page.locator("#undo-button").click();
	await expect(page.locator("#path-count")).toHaveText("1");
	await expect(canvas.locator("#rsc__eraser-stroke-group path")).toHaveCount(0);

	await page.locator("#redo-button").click();
	await expect(page.locator("#path-count")).toHaveText("2");
	await expect(canvas.locator("#rsc__eraser-stroke-group path")).toHaveCount(1);

	await page.locator("#export-svg-button").click();
	await expect(page.locator("#exported-svg")).toContainText("rsc__eraser-0");
});
