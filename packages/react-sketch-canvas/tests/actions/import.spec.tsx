import { expect, test } from "@playwright/experimental-ct-react";
import type { CanvasPath } from "../../src";
import { getCanvasIds } from "../commands";
import penAndEraserStrokes from "../fixtures/penAndEraserStroke.json";
import { WithLoadPathsButton } from "../fixtures/WithLoadPathsButton.fixture";

test.use({ viewport: { width: 500, height: 500 } });

const canvasId = "rsc";
const loadPathsButtonId = "load-paths";
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
