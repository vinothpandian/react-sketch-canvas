import { expect, test } from "@playwright/experimental-ct-react";
import { CanvasPath, ReactSketchCanvas } from "react-sketch-canvas";
import { drawLine, drawSquares, getCanvasIds } from "../commands";
import { WithEraserButton } from "../stories/WithEraserButton.story";

test.use({ viewport: { width: 500, height: 500 } });

test.describe("Eraser", () => {
  test("should trigger erase mode and add a mask for erasing previous strokes", async ({
    mount,
  }) => {
    const handleChange = (updatedPaths: CanvasPath[]) => {
      // Do nothing
    };

    const canvasId = "rsc";
    const eraserButtonId = "eraser-button";
    const penButtonId = "pen-button";

    const component = await mount(
      <WithEraserButton
        id={canvasId}
        eraserButtonId={eraserButtonId}
        penButtonId={penButtonId}
        onChange={handleChange}
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
});
