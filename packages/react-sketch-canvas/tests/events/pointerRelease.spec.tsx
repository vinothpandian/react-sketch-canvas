import { expect, test } from "@playwright/experimental-ct-react";
import { type CanvasPath, ReactSketchCanvas } from "../../src";

test.use({ viewport: { width: 500, height: 500 } });

test("captured canvas pointerup completes an in-progress stroke after leaving the canvas", async ({
	mount,
}) => {
	let paths: CanvasPath[] = [];
	const component = await mount(
		<ReactSketchCanvas
			id="rsc"
			withTimestamp
			onChange={(updatedPaths) => {
				paths = [...updatedPaths];
			}}
		/>,
	);

	const canvas = component.locator("#rsc");
	const box = await canvas.boundingBox();

	if (!box) {
		throw new Error("Canvas not found");
	}

	await canvas.dispatchEvent("pointerdown", {
		pointerId: 1,
		pointerType: "pen",
		button: 0,
		buttons: 1,
		clientX: box.x + 10,
		clientY: box.y + 10,
		pageX: box.x + 10,
		pageY: box.y + 10,
	});
	await canvas.dispatchEvent("pointermove", {
		pointerId: 1,
		pointerType: "pen",
		button: 0,
		buttons: 1,
		clientX: box.x + 40,
		clientY: box.y + 40,
		pageX: box.x + 40,
		pageY: box.y + 40,
	});
	await canvas.dispatchEvent("pointerup", {
		pointerId: 1,
		pointerType: "pen",
		button: 0,
		buttons: 0,
	});

	await expect.poll(() => paths.at(0)?.endTimestamp ?? 0).toBeGreaterThan(0);
	expect(paths[0]?.paths).toHaveLength(2);
});
