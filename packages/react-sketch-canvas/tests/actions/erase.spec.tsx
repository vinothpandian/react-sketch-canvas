import { expect, test } from "@playwright/experimental-ct-react";
import { type CanvasPath, ReactSketchCanvas } from "../../src";
import { drawLine, getCanvasIds } from "../commands";
import { WithEraserButton } from "../stories/WithEraserButton.story";
import { WithExportPathsButton } from "../stories/WithExportPathsButton.story";
import { WithUndoRedoButtons } from "../stories/WithUndoRedoButtons";

test.use({ viewport: { width: 500, height: 500 } });

test.describe("eraser", () => {
	test("should keep eraser masks isolated across canvases with the default public id", async ({
		mount,
	}) => {
		const firstEraserButtonId = "first-eraser-button";
		const secondEraserButtonId = "second-eraser-button";

		const component = await mount(
			<div>
				<WithEraserButton eraserButtonId={firstEraserButtonId} />
				<WithEraserButton eraserButtonId={secondEraserButtonId} />
			</div>,
		);

		const firstCanvas = component
			.locator('svg[id="react-sketch-canvas"]')
			.nth(0);
		const secondCanvas = component
			.locator('svg[id="react-sketch-canvas"]')
			.nth(1);

		await drawLine(firstCanvas, { length: 50, originX: 0, originY: 10 });
		await component.locator(`#${firstEraserButtonId}`).click();
		await drawLine(firstCanvas, { length: 10, originX: 0, originY: 10 });

		await drawLine(secondCanvas, { length: 50, originX: 10, originY: 20 });
		await component.locator(`#${secondEraserButtonId}`).click();
		await drawLine(secondCanvas, { length: 10, originX: 10, originY: 20 });

		const firstStrokeGroup = firstCanvas.locator('[id$="__stroke-group-0"]');
		const secondStrokeGroup = secondCanvas.locator('[id$="__stroke-group-0"]');
		const firstMask = firstCanvas.locator('mask[id$="__eraser-mask-0"]');
		const secondMask = secondCanvas.locator('mask[id$="__eraser-mask-0"]');
		const firstMaskId = await firstMask.getAttribute("id");
		const secondMaskId = await secondMask.getAttribute("id");

		expect(firstMaskId).toBeTruthy();
		expect(secondMaskId).toBeTruthy();
		expect(firstMaskId).not.toBe(secondMaskId);
		await expect(firstStrokeGroup).toHaveAttribute(
			"mask",
			`url(#${firstMaskId})`,
		);
		await expect(secondStrokeGroup).toHaveAttribute(
			"mask",
			`url(#${secondMaskId})`,
		);
	});

	test("should trigger erase mode and add a mask for erasing previous strokes", async ({
		mount,
	}) => {
		const canvasId = "rsc";
		const eraserButtonId = "eraser-button";
		const penButtonId = "pen-button";

		const component = await mount(
			<WithEraserButton
				id={canvasId}
				eraserButtonId={eraserButtonId}
				penButtonId={penButtonId}
			/>,
		);

		const {
			eraserStrokeGroupId,
			firstEraserMask,
			firstStrokeGroupId,
			secondStrokeGroupId,
			secondEraserMask,
		} = getCanvasIds(canvasId);

		const canvas = component.locator(`#${canvasId}`);
		const eraserButton = component.locator(`#${eraserButtonId}`);
		const penButton = component.locator(`#${penButtonId}`);

		// First stroke & eraser stroke

		await drawLine(canvas, {
			length: 50,
			originX: 0,
			originY: 10,
		});

		await eraserButton.click();
		await drawLine(canvas, {
			length: 10,
			originX: 0,
			originY: 10,
		});

		// Check that the eraser stroke group and a path for the eraser stroke are added
		await expect(
			canvas.locator(eraserStrokeGroupId).locator("path"),
		).toHaveCount(1);
		// Check that the eraser mask is added
		await expect(canvas.locator(firstEraserMask).locator("use")).toHaveCount(2);
		const firstEraserMaskId = await canvas
			.locator(firstEraserMask)
			.getAttribute("id");

		// Check that the first stroke group has the eraser mask
		await expect(canvas.locator(firstStrokeGroupId)).toHaveAttribute(
			"mask",
			`url(#${firstEraserMaskId})`,
		);

		// Check that the first stroke group has a path
		await expect(
			canvas.locator(firstStrokeGroupId).locator("path"),
		).toHaveCount(1);

		// Second stroke & eraser stroke
		await penButton.click();
		await drawLine(canvas, {
			length: 50,
			originX: 10,
			originY: 20,
		});

		await eraserButton.click();
		await drawLine(canvas, {
			length: 10,
			originX: 10,
			originY: 20,
		});

		// Check that the eraser stroke group and a path for the eraser stroke are added again
		await expect(
			canvas.locator(eraserStrokeGroupId).locator("path"),
		).toHaveCount(2);

		// Check that the eraser mask is added again in first mask for the second eraser stroke
		await expect(canvas.locator(firstEraserMask).locator("use")).toHaveCount(3); // background + 2 eraser masks

		// Check that the eraser mask is added
		await expect(canvas.locator(secondEraserMask).locator("use")).toHaveCount(
			2,
		); // background + eraser mask
		const secondEraserMaskId = await canvas
			.locator(secondEraserMask)
			.getAttribute("id");

		// Check that the second stroke group has the eraser mask
		await expect(canvas.locator(secondStrokeGroupId)).toHaveAttribute(
			"mask",
			`url(#${secondEraserMaskId})`,
		);
	});

	test("should not set mask attribute on stroke group when no eraser paths exist", async ({
		mount,
	}) => {
		const canvasId = "rsc";

		const component = await mount(<ReactSketchCanvas id={canvasId} />);

		const { firstStrokeGroupId } = getCanvasIds(canvasId);

		const canvas = component.locator(`#${canvasId}`);

		// Draw a stroke without using the eraser
		await drawLine(canvas, {
			length: 50,
			originX: 0,
			originY: 10,
		});

		// The stroke group should not have a mask attribute when there are no eraser paths
		await expect(canvas.locator(firstStrokeGroupId)).not.toHaveAttribute(
			"mask",
		);

		// Verify the stroke path exists
		await expect(
			canvas.locator(firstStrokeGroupId).locator("path"),
		).toHaveCount(1);
	});

	test("should not set mask attribute on last stroke group after erasing", async ({
		mount,
	}) => {
		const canvasId = "rsc";
		const eraserButtonId = "eraser-button";
		const penButtonId = "pen-button";

		const component = await mount(
			<WithEraserButton
				id={canvasId}
				eraserButtonId={eraserButtonId}
				penButtonId={penButtonId}
			/>,
		);

		const { firstStrokeGroupId, secondStrokeGroupId } = getCanvasIds(canvasId);

		const canvas = component.locator(`#${canvasId}`);
		const eraserButton = component.locator(`#${eraserButtonId}`);
		const penButton = component.locator(`#${penButtonId}`);

		// Draw → Erase → Draw (creates 2 stroke groups, only first has a mask)
		await drawLine(canvas, { length: 50, originX: 0, originY: 10 });
		await eraserButton.click();
		await drawLine(canvas, { length: 10, originX: 0, originY: 10 });
		await penButton.click();
		await drawLine(canvas, { length: 50, originX: 10, originY: 20 });

		const firstEraserMaskId = await canvas
			.locator('mask[id$="__eraser-mask-0"]')
			.getAttribute("id");

		// First stroke group should have the eraser mask
		await expect(canvas.locator(firstStrokeGroupId)).toHaveAttribute(
			"mask",
			`url(#${firstEraserMaskId})`,
		);

		// Second stroke group (after last eraser) should NOT have a mask
		await expect(canvas.locator(secondStrokeGroupId)).not.toHaveAttribute(
			"mask",
		);
	});

	test("should trigger erase mode with windows surface pen eraser", async ({
		mount,
	}) => {
		const canvasId = "rsc";

		const canvas = await mount(<ReactSketchCanvas id={canvasId} />);

		const { eraserStrokeGroupId, firstEraserMask, firstStrokeGroupId } =
			getCanvasIds(canvasId);

		// First stroke
		await drawLine(canvas, {
			length: 50,
			originX: 0,
			originY: 10,
			pointerType: "pen",
		});

		// Eraser stroke with windows surface pen eraser
		await drawLine(canvas, {
			length: 10,
			originX: 0,
			originY: 10,
			pointerType: "pen",
			eventButtons: 32,
		});

		// Check that the eraser stroke group and a path for the eraser stroke are added
		await expect(
			canvas.locator(eraserStrokeGroupId).locator("path"),
		).toHaveCount(1);
		// Check that the eraser mask is added
		await expect(canvas.locator(firstEraserMask).locator("use")).toHaveCount(2);
		const firstEraserMaskId = await canvas
			.locator(firstEraserMask)
			.getAttribute("id");

		// Check that the first stroke group has the eraser mask
		await expect(canvas.locator(firstStrokeGroupId)).toHaveAttribute(
			"mask",
			`url(#${firstEraserMaskId})`,
		);

		// Check that the first stroke group has a path
		await expect(
			canvas.locator(firstStrokeGroupId).locator("path"),
		).toHaveCount(1);
	});

	test("should keep eraser mask source paths in defs for Firefox rendering", async ({
		mount,
	}) => {
		const canvasId = "rsc";
		const eraserButtonId = "eraser-button";

		const component = await mount(
			<WithEraserButton id={canvasId} eraserButtonId={eraserButtonId} />,
		);

		const canvas = component.locator(`#${canvasId}`);

		await drawLine(canvas, { length: 50, originX: 0, originY: 10 });
		await component.locator(`#${eraserButtonId}`).click();
		await drawLine(canvas, { length: 10, originX: 0, originY: 10 });

		const eraserStrokeGroup = canvas.locator(
			'defs > [id$="__eraser-stroke-group"]',
		);

		await expect(eraserStrokeGroup.locator("path")).toHaveCount(1);
		await expect(eraserStrokeGroup).not.toHaveAttribute("display", "none");
	});

	test.describe("stroke eraser mode", () => {
		test("should delete whole affected strokes without rendering eraser masks", async ({
			mount,
		}) => {
			const canvasId = "rsc";
			const eraserButtonId = "eraser-button";
			const component = await mount(
				<WithEraserButton
					id={canvasId}
					eraserButtonId={eraserButtonId}
					eraserMode="stroke"
				/>,
			);

			const canvas = component.locator(`#${canvasId}`);
			const { firstStrokeGroupId, eraserStrokeGroupId } =
				getCanvasIds(canvasId);

			await drawLine(canvas, { length: 50, originX: 0, originY: 10 });
			await drawLine(canvas, { length: 50, originX: 0, originY: 80 });
			await component.locator(`#${eraserButtonId}`).click();
			await drawLine(canvas, { length: 10, originX: 0, originY: 10 });

			await expect(
				canvas.locator(firstStrokeGroupId).locator("path"),
			).toHaveCount(1);
			await expect(
				canvas.locator(firstStrokeGroupId).locator("path"),
			).toHaveAttribute("stroke", "red");
			await expect(
				canvas.locator(eraserStrokeGroupId).locator("path"),
			).toHaveCount(0);
			await expect(canvas.locator('mask[id$="__eraser-mask-0"]')).toHaveCount(
				0,
			);
		});

		test("should undo and redo a stroke eraser deletion", async ({ mount }) => {
			const canvasId = "rsc";
			const undoButtonId = "undo-button";
			const redoButtonId = "redo-button";

			const component = await mount(
				<WithUndoRedoButtons
					id={canvasId}
					eraserMode="stroke"
					undoButtonId={undoButtonId}
					redoButtonId={redoButtonId}
					paths={[]}
				/>,
			);

			const canvas = component.locator(`#${canvasId}`);
			const { firstStrokeGroupId } = getCanvasIds(canvasId);

			await drawLine(canvas, { length: 50, originX: 0, originY: 10 });
			await drawLine(canvas, {
				length: 10,
				originX: 0,
				originY: 10,
				pointerType: "pen",
				eventButtons: 32,
			});

			await expect(
				canvas.locator(firstStrokeGroupId).locator("path"),
			).toHaveCount(0);

			await component.locator(`#${undoButtonId}`).click();
			await expect(
				canvas.locator(firstStrokeGroupId).locator("path"),
			).toHaveCount(1);

			await component.locator(`#${redoButtonId}`).click();
			await expect(
				canvas.locator(firstStrokeGroupId).locator("path"),
			).toHaveCount(0);
		});

		test("should export only remaining draw strokes", async ({ mount }) => {
			const canvasId = "rsc";
			const exportPathsButtonId = "export-paths-button";
			const outputId = "paths-output";

			const component = await mount(
				<WithExportPathsButton
					id={canvasId}
					eraserMode="stroke"
					exportPathsButtonId={exportPathsButtonId}
					outputId={outputId}
				/>,
			);

			const canvas = component.locator(`#${canvasId}`);
			await drawLine(canvas, { length: 50, originX: 0, originY: 10 });
			await drawLine(canvas, { length: 50, originX: 0, originY: 80 });
			await drawLine(canvas, {
				length: 10,
				originX: 0,
				originY: 10,
				pointerType: "pen",
				eventButtons: 32,
			});

			await component.locator(`#${exportPathsButtonId}`).click();

			const exported = JSON.parse(
				(await component.locator(`#${outputId}`).textContent()) ?? "[]",
			) as CanvasPath[];

			expect(exported).toHaveLength(1);
			expect(exported[0]?.drawMode).toBe(true);
			expect(exported[0]?.paths[0]?.y).toBeGreaterThan(50);
		});

		test("should use stroke eraser mode for pen eraser input", async ({
			mount,
		}) => {
			const canvasId = "rsc";
			const canvas = await mount(
				<ReactSketchCanvas id={canvasId} eraserMode="stroke" />,
			);
			const { firstStrokeGroupId, eraserStrokeGroupId } =
				getCanvasIds(canvasId);

			await drawLine(canvas, {
				length: 50,
				originX: 0,
				originY: 10,
				pointerType: "pen",
			});
			await drawLine(canvas, {
				length: 10,
				originX: 0,
				originY: 10,
				pointerType: "pen",
				eventButtons: 32,
			});

			await expect(
				canvas.locator(firstStrokeGroupId).locator("path"),
			).toHaveCount(0);
			await expect(
				canvas.locator(eraserStrokeGroupId).locator("path"),
			).toHaveCount(0);
		});
	});
});
