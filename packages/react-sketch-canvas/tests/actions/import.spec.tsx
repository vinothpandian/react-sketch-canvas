import { expect, test } from "@playwright/experimental-ct-react";
import type { CanvasPath } from "../../src";
import { drawSquare, getCanvasIds } from "../commands";
import penAndEraserStrokes from "../fixtures/penAndEraserStroke.json";
import { WithLoadPathsButton } from "../fixtures/WithLoadPathsButton.fixture";

test.use({ viewport: { width: 500, height: 500 } });

const canvasId = "rsc";
const loadPathsButtonId = "load-paths";
const exportSVGButtonId = "export-svg";
const { firstStrokeGroupId, eraserStrokeGroupId } = getCanvasIds();
const offCanvasStrokes: CanvasPath[] = [
	{
		drawMode: true,
		strokeColor: "#000000",
		strokeWidth: 4,
		paths: [
			{ x: -10, y: 50 },
			{ x: 600, y: 150 },
		],
	},
];

test.describe("loadPaths", () => {
	test("should load path with only pen", async ({ mount }) => {
		const component = await mount(
			<WithLoadPathsButton
				id={canvasId}
				width="500px"
				height="500px"
				withViewBox
				loadPathsButtonId={loadPathsButtonId}
				paths={offCanvasStrokes}
			/>,
		);

		const canvas = component.locator("svg");
		const loadPathsButton = component.locator(`#${loadPathsButtonId}`);

		await expect(
			canvas.locator(firstStrokeGroupId).locator("path"),
		).toHaveCount(0);

		await loadPathsButton.click();

		await expect(
			component.locator(firstStrokeGroupId).locator("path"),
		).toHaveCount(1);
		await expect(canvas).toHaveAttribute("viewBox", "-12 0 614 500");
	});

	test("should draw new strokes under the pointer after the viewBox expands", async ({
		mount,
	}) => {
		const component = await mount(
			<WithLoadPathsButton
				id={canvasId}
				width="500px"
				height="500px"
				withViewBox
				loadPathsButtonId={loadPathsButtonId}
				paths={offCanvasStrokes}
			/>,
		);

		const canvas = component.locator("svg");
		await component.locator(`#${loadPathsButtonId}`).click();
		await expect(canvas).toHaveAttribute("viewBox", "-12 0 614 500");

		await drawSquare(canvas, { side: 100, originX: 200, originY: 200 });

		const newStroke = component.locator('[id$="__stroke-group-0__paths__1"]');
		await expect(newStroke).toHaveCount(1);

		const { origin, start, firstCorner } = await canvas.evaluate(
			(svg: SVGSVGElement) => {
				const matrix = svg.getScreenCTM();
				const d =
					svg
						.querySelector('[id$="__stroke-group-0__paths__1"]')
						?.getAttribute("d") ?? "";
				const coords = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
				const toScreen = (x: number, y: number) => {
					const point = new DOMPoint(x, y).matrixTransform(matrix ?? undefined);
					return { x: point.x, y: point.y };
				};
				const rect = svg.getBoundingClientRect();

				return {
					origin: { x: rect.left, y: rect.top },
					start: toScreen(coords[0], coords[1]),
					firstCorner: toScreen(coords[6], coords[7]),
				};
			},
		);

		expect(start.x).toBeCloseTo(origin.x + 200, 0);
		expect(start.y).toBeCloseTo(origin.y + 200, 0);
		expect(firstCorner.x).toBeCloseTo(origin.x + 200, 0);
		expect(firstCorner.y).toBeCloseTo(origin.y + 300, 0);
	});

	test("should keep the expanded viewBox in SVG exports", async ({ mount }) => {
		let exportedSvg: string | undefined;
		const component = await mount(
			<WithLoadPathsButton
				id={canvasId}
				width="500px"
				height="500px"
				withViewBox
				loadPathsButtonId={loadPathsButtonId}
				exportSVGButtonId={exportSVGButtonId}
				paths={offCanvasStrokes}
				onExportSVG={(svg) => {
					exportedSvg = svg;
				}}
			/>,
		);

		await component.locator(`#${loadPathsButtonId}`).click();
		await expect(component.locator("svg")).toHaveAttribute(
			"viewBox",
			"-12 0 614 500",
		);
		await component.locator(`#${exportSVGButtonId}`).click();

		await expect.poll(() => exportedSvg).toContain('viewBox="-12 0 614 502"');
	});

	test("should load path with pen and eraser", async ({ mount }) => {
		const component = await mount(
			<WithLoadPathsButton
				id={canvasId}
				loadPathsButtonId={loadPathsButtonId}
				paths={penAndEraserStrokes}
			/>,
		);

		const canvas = component.locator("svg");
		const loadPathsButton = component.locator(`#${loadPathsButtonId}`);

		await expect(
			canvas.locator(firstStrokeGroupId).locator("path"),
		).toHaveCount(0);

		await loadPathsButton.click();

		await expect(
			component.locator(firstStrokeGroupId).locator("path"),
		).toHaveCount(1);

		await expect(
			component.locator(eraserStrokeGroupId).locator("path"),
		).toHaveCount(1);
	});
});
