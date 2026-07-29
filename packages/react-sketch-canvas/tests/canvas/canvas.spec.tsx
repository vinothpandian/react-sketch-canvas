import { expect, test } from "@playwright/experimental-ct-react";
import type { Locator } from "playwright/test";
import { type CanvasPath, ReactSketchCanvas } from "../../src";
import { drawSquares } from "../commands";

test.use({ viewport: { width: 500, height: 500 } });

async function dispatchPointerAtCanvasPoint(
	canvas: Locator,
	eventType: "pointerdown" | "pointermove" | "pointerup",
	point: { x: number; y: number },
) {
	const screenPoint = await canvas.evaluate((svg, localPoint) => {
		const screenMatrix = (svg as SVGSVGElement).getScreenCTM();

		if (!screenMatrix) {
			throw new Error("SVG screen matrix is unavailable");
		}

		const projectedPoint = new DOMPoint(
			localPoint.x,
			localPoint.y,
		).matrixTransform(screenMatrix);

		return {
			x: projectedPoint.x,
			y: projectedPoint.y,
		};
	}, point);

	await canvas.dispatchEvent(eventType, {
		pointerId: 21,
		pointerType: "pen",
		button: eventType === "pointerup" ? -1 : 0,
		buttons: eventType === "pointerup" ? 0 : 1,
		clientX: screenPoint.x,
		clientY: screenPoint.y,
		pageX: screenPoint.x,
		pageY: screenPoint.y,
	});
}

test("should contain the canvas with svg", async ({ mount }) => {
	const component = await mount(
		<ReactSketchCanvas width="100%" height="500px" />,
	);

	await expect(component).toBeVisible();

	await drawSquares(component);

	const canvas = component.locator("svg");
	await expect(canvas).toBeVisible();
	await expect(canvas.locator("path")).toHaveCount(3);
});

test("should normalize pointer coordinates through affine CSS transforms", async ({
	mount,
}) => {
	let paths: CanvasPath[] = [];
	const handleChange = (updatedPaths: CanvasPath[]) => {
		paths = [...updatedPaths];
	};
	const canvasId = "affine-rsc";
	const startPoint = { x: 48, y: 56 };
	const endPoint = { x: 132, y: 118 };

	const component = await mount(
		<div
			style={{
				margin: "120px",
				width: "240px",
				height: "180px",
				transform:
					"translate(24px, 16px) rotate(18deg) skewX(12deg) scale(1.2, 0.85)",
				transformOrigin: "top left",
			}}
		>
			<ReactSketchCanvas
				id={canvasId}
				width="240px"
				height="180px"
				strokeWidth={4}
				onChange={handleChange}
			/>
		</div>,
	);

	const canvas = component.locator(`#${canvasId}`);

	await dispatchPointerAtCanvasPoint(canvas, "pointerdown", startPoint);
	await dispatchPointerAtCanvasPoint(canvas, "pointermove", endPoint);
	await dispatchPointerAtCanvasPoint(canvas, "pointerup", endPoint);

	expect(paths).toHaveLength(1);
	expect(paths[0]?.paths[0]?.x).toBeCloseTo(startPoint.x, 1);
	expect(paths[0]?.paths[0]?.y).toBeCloseTo(startPoint.y, 1);
	expect(paths[0]?.paths[1]?.x).toBeCloseTo(endPoint.x, 1);
	expect(paths[0]?.paths[1]?.y).toBeCloseTo(endPoint.y, 1);
});
