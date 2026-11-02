import { expect, type Page, test } from "playwright/test";
import { drawLine } from "../../tests/commands";

async function getSvgPixel(page: Page, selector: string, x: number, y: number) {
	return page.evaluate(
		async ({ selector, x, y }) => {
			const svg = document.querySelector(selector);

			if (!(svg instanceof SVGSVGElement)) {
				throw new Error(`SVG not found for selector: ${selector}`);
			}

			const image = new Image();
			const svgClone = svg.cloneNode(true) as SVGSVGElement;
			const width = svg.clientWidth;
			const height = svg.clientHeight;

			svgClone.setAttribute("width", width.toString());
			svgClone.setAttribute("height", height.toString());
			svgClone.setAttribute("viewBox", `0 0 ${width} ${height}`);

			const svgText = new XMLSerializer().serializeToString(svgClone);
			const url = URL.createObjectURL(
				new Blob([svgText], { type: "image/svg+xml" }),
			);

			try {
				await new Promise<void>((resolve, reject) => {
					image.addEventListener("load", () => resolve(), { once: true });
					image.addEventListener(
						"error",
						() => reject(new Error("SVG load failed")),
						{
							once: true,
						},
					);
					image.src = url;
				});

				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;

				const context = canvas.getContext("2d");

				if (!context) {
					throw new Error("2D canvas context unavailable");
				}

				context.drawImage(image, 0, 0);

				return Array.from(context.getImageData(x, y, 1, 1).data);
			} finally {
				URL.revokeObjectURL(url);
			}
		},
		{ selector, x, y },
	);
}

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

test("renders pen strokes outside the upper-left quadrant in Firefox", async ({
	page,
}) => {
	await page.goto("/");

	const canvas = page.locator("#rsc");
	await drawLine(canvas, { length: 60, originX: 300, originY: 220 });

	await expect(canvas.locator("path")).toHaveCount(1);

	const strokePixel = await getSvgPixel(page, "#rsc", 330, 250);

	expect(strokePixel[0]).toBeGreaterThan(200);
	expect(strokePixel[1]).toBeLessThan(80);
	expect(strokePixel[2]).toBeLessThan(80);
	expect(strokePixel[3]).toBe(255);
});

test("supports eraser mode with undo and redo controls", async ({ page }) => {
	await page.goto("/");

	const canvas = page.locator("#rsc");

	await drawLine(canvas, { length: 80, originX: 20, originY: 20 });
	await page.locator("#eraser-button").click();
	await drawLine(canvas, { length: 30, originX: 20, originY: 20 });

	await expect(page.locator("#path-count")).toHaveText("2");
	await expect(
		canvas.locator('[id$="__eraser-stroke-group"] path'),
	).toHaveCount(1);

	await page.locator("#undo-button").click();
	await expect(page.locator("#path-count")).toHaveText("1");
	await expect(
		canvas.locator('[id$="__eraser-stroke-group"] path'),
	).toHaveCount(0);

	await page.locator("#redo-button").click();
	await expect(page.locator("#path-count")).toHaveText("2");
	await expect(
		canvas.locator('[id$="__eraser-stroke-group"] path'),
	).toHaveCount(1);

	await page.locator("#export-svg-button").click();
	await expect(page.locator("#exported-svg")).toContainText(
		/rsc__export-\d+.*__eraser-0/,
	);
	await expect(page.locator("#exported-svg")).not.toContainText("undefined");
});

test("renders erased pixels as canvas background in Firefox-compatible SVG masks", async ({
	page,
}) => {
	await page.goto("/");

	const canvas = page.locator("#rsc");
	await drawLine(canvas, { length: 80, originX: 20, originY: 20 });
	await page.locator("#eraser-button").click();
	await drawLine(canvas, { length: 30, originX: 20, originY: 20 });

	await expect(
		canvas.locator('[id$="__eraser-stroke-group"] path'),
	).toHaveCount(1);

	const erasedPixel = await getSvgPixel(page, "#rsc", 30, 30);

	expect(erasedPixel).toEqual([255, 255, 255, 255]);
});

test.describe("touch gestures", () => {
	test.use({ hasTouch: true });
	test.skip(
		({ browserName }) => browserName !== "chromium",
		"Touch gestures are dispatched through the Chromium DevTools protocol",
	);

	type TouchPoint = { x: number; y: number; id: number };

	async function dragTouches(
		page: Page,
		fingers: number,
		{ x, y }: { x: number; y: number },
	) {
		const cdp = await page.context().newCDPSession(page);
		const pointsAt = (dy: number): TouchPoint[] =>
			Array.from({ length: fingers }, (_, id) => ({
				x: x + id * 40,
				y: y + dy,
				id,
			}));

		await cdp.send("Input.dispatchTouchEvent", {
			type: "touchStart",
			touchPoints: pointsAt(0),
		});
		for (let dy = -10; dy >= -120; dy -= 10) {
			await cdp.send("Input.dispatchTouchEvent", {
				type: "touchMove",
				touchPoints: pointsAt(dy),
			});
		}
		await cdp.send("Input.dispatchTouchEvent", {
			type: "touchEnd",
			touchPoints: [],
		});
	}

	async function openTallPage(page: Page, search = "") {
		await page.goto(`/${search}`);
		await page.evaluate(() => {
			document.body.style.paddingBottom = "3000px";
		});

		const box = await page.locator("#rsc").boundingBox();

		if (!box) {
			throw new Error("Canvas has no bounding box");
		}

		return { x: box.x + 60, y: box.y + box.height - 40 };
	}

	test("one finger draws without scrolling the page", async ({ page }) => {
		const start = await openTallPage(page);

		await dragTouches(page, 1, start);

		await expect(page.locator("#rsc path")).toHaveCount(1);
		expect(await page.evaluate(() => window.scrollY)).toBe(0);
	});

	test("two fingers scroll the page instead of drawing", async ({ page }) => {
		const start = await openTallPage(page);

		await dragTouches(page, 2, start);

		await expect
			.poll(() => page.evaluate(() => window.scrollY))
			.toBeGreaterThan(0);

		// The canvas keeps working once the second finger lifts.
		await page.evaluate(() => window.scrollTo(0, 0));
		const before = await page.locator("#rsc path").count();
		await dragTouches(page, 1, start);
		await expect(page.locator("#rsc path")).toHaveCount(before + 1);
	});

	test("allowMultiTouchScroll={false} keeps two fingers from scrolling", async ({
		page,
	}) => {
		const start = await openTallPage(page, "?multiTouchScroll=false");

		await dragTouches(page, 2, start);

		expect(await page.evaluate(() => window.scrollY)).toBe(0);
	});
});
