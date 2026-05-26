import { expect, test } from "playwright/test";

test("renders 1000 loaded strokes with 1000 points each", async ({ page }) => {
	test.setTimeout(120_000);

	await page.goto("/");

	await page.locator("#load-stress-paths-button").click();

	await expect(page.locator("#path-count")).toHaveText("1000", {
		timeout: 120_000,
	});
	await expect(page.locator("#rsc path")).toHaveCount(1000, {
		timeout: 120_000,
	});
	await expect(page.locator("#stress-point-count")).toHaveText("1000000");

	await page.locator("#export-svg-button").click();
	await expect(page.locator("#exported-svg")).toContainText("<svg", {
		timeout: 120_000,
	});
	await expect(page.locator("#exported-svg")).toContainText(
		"__stroke-group-0__paths__999",
		{ timeout: 120_000 },
	);
});

test("renders a dense eraser mask workload", async ({ page }) => {
	await page.goto("/");

	await page.locator("#load-eraser-stress-paths-button").click();
	await expect(page.locator("#path-count")).toHaveText("100");

	const canvasBox = await page.locator("#rsc").boundingBox();
	expect(canvasBox).not.toBeNull();

	if (!canvasBox) return;

	for (let index = 0; index < 100; index += 1) {
		const x = canvasBox.x + 10 + (index % 30);
		const y = canvasBox.y + 12 + index * 2;

		await page.mouse.move(x, y - 4);
		await page.mouse.down();
		await page.mouse.move(x, y + 4);
		await page.mouse.up();
	}

	await expect(page.locator("#path-count")).toHaveText("200");
	await expect(
		page.locator('#rsc [id$="__eraser-stroke-group"] path'),
	).toHaveCount(100);
	await expect(page.locator("#rsc mask")).toHaveCount(100);
});

test("records a rapid 1000 point pointer burst as one stroke", async ({
	page,
}) => {
	await page.goto("/");

	const pointCount = await page.locator("#rsc").evaluate(async (svg) => {
		const bounds = svg.getBoundingClientRect();
		const pointerId = 730;
		const dispatchPointerEvent = (
			type: "pointerdown" | "pointermove" | "pointerup",
			offsetX: number,
			offsetY: number,
		) => {
			svg.dispatchEvent(
				new PointerEvent(type, {
					bubbles: true,
					cancelable: true,
					pointerId,
					pointerType: "pen",
					button: 0,
					buttons: type === "pointerup" ? 0 : 1,
					clientX: bounds.left + offsetX,
					clientY: bounds.top + offsetY,
				}),
			);
		};

		dispatchPointerEvent("pointerdown", 20, 20);
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => resolve()),
		);

		for (let i = 1; i <= 1000; i += 1) {
			dispatchPointerEvent("pointermove", 20 + (i % 380), 20 + (i % 260));
		}

		dispatchPointerEvent("pointerup", 399, 279);
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => resolve()),
		);
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => resolve()),
		);

		const path = document.querySelector("#rsc path");

		return path?.getAttribute("d")?.match(/C /g)?.length ?? 0;
	});

	await expect(page.locator("#path-count")).toHaveText("1");
	expect(pointCount).toBeGreaterThan(900);
});

test("keeps the viewBox aligned when loaded paths are resized", async ({
	page,
}) => {
	await page.goto("/");

	await page.locator("#load-viewbox-paths-button").click();
	await expect(page.locator("#rsc")).toHaveAttribute("viewBox", "0 0 420 320");

	await page.locator("#resize-canvas-button").click();
	await expect(page.locator("#rsc")).toHaveAttribute("viewBox", "0 0 560 360");
	await expect(page.locator("#rsc path")).toHaveCount(1);
});
