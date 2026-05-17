import { expect, test } from "@playwright/experimental-ct-react";
import { ReactSketchCanvas } from "../../src";
import { drawLine, getCanvasIds } from "../commands";
import { WithEraserButton } from "../stories/WithEraserButton.story";

test.use({ viewport: { width: 500, height: 500 } });

test.describe("eraser", () => {
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
      firstEraserMaskId,
      firstEraserMask,
      firstStrokeGroupId,
      secondEraserMaskId,
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

    // First stroke group should have the eraser mask
    await expect(canvas.locator(firstStrokeGroupId)).toHaveAttribute(
      "mask",
      `url(#${canvasId}__eraser-mask-0)`,
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

    const {
      eraserStrokeGroupId,
      firstEraserMaskId,
      firstEraserMask,
      firstStrokeGroupId,
    } = getCanvasIds(canvasId);

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
});
