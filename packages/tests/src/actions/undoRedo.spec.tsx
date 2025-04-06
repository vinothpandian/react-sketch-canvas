import { expect, test } from "@playwright/experimental-ct-react";

import { drawEraserLine, drawLine, getCanvasIds } from "../commands";
import { WithUndoRedoButtons } from "../stories/WithUndoRedoButtons";

test.use({ viewport: { width: 500, height: 500 } });

const canvasId = "rsc";
const undoButtonId = "undo-button";
const redoButtonId = "redo-button";
const clearCanvasButtonId = "clear-canvas-button";
const resetCanvasButtonId = "reset-canvas-button";

const { firstStrokeGroupId, eraserStrokeGroupId } = getCanvasIds(canvasId);

test.describe("undo", () => {
  test("should undo a stroke", async ({ mount }) => {
    const component = await mount(
      <WithUndoRedoButtons
        id={canvasId}
        undoButtonId={undoButtonId}
        redoButtonId={redoButtonId}
        clearCanvasButtonId={clearCanvasButtonId}
        resetCanvasButtonId={resetCanvasButtonId}
      />,
    );

    const canvas = component.locator(`#${canvasId}`);

    await drawLine(canvas, {
      length: 50,
      originX: 0,
      originY: 10,
    });

    await expect(
      component.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(1);

    const undoButton = component.locator(`#${undoButtonId}`);
    await undoButton.click();

    await expect(
      component.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(0);
  });

  test("should undo an eraser stroke", async ({ mount }) => {
    const component = await mount(
      <WithUndoRedoButtons
        id={canvasId}
        undoButtonId={undoButtonId}
        redoButtonId={redoButtonId}
        clearCanvasButtonId={clearCanvasButtonId}
        resetCanvasButtonId={resetCanvasButtonId}
      />,
    );

    const canvas = component.locator(`#${canvasId}`);

    await drawLine(canvas, {
      length: 50,
      originX: 0,
      originY: 10,
    });

    await drawEraserLine(canvas, {
      length: 10,
      originX: 0,
      originY: 10,
    });

    await expect(
      component.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(1);

    await expect(
      component.locator(eraserStrokeGroupId).locator("path"),
    ).toHaveCount(1);

    const undoButton = component.locator(`#${undoButtonId}`);
    await undoButton.click();

    await expect(
      component.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(1);

    await expect(
      component.locator(eraserStrokeGroupId).locator("path"),
    ).toHaveCount(0);
  });
});

test.describe("redo", () => {
  test("should redo a stroke", async ({ mount }) => {
    const component = await mount(
      <WithUndoRedoButtons
        id={canvasId}
        undoButtonId={undoButtonId}
        redoButtonId={redoButtonId}
        clearCanvasButtonId={clearCanvasButtonId}
        resetCanvasButtonId={resetCanvasButtonId}
      />,
    );

    const canvas = component.locator(`#${canvasId}`);
    const undoButton = component.locator(`#${undoButtonId}`);
    const redoButton = component.locator(`#${redoButtonId}`);

    await drawLine(canvas, {
      length: 50,
      originX: 0,
      originY: 10,
    });

    await expect(
      component.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(1);

    await undoButton.click();

    await expect(
      component.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(0);

    await redoButton.click();
    await expect(
      component.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(1);
  });

  test("should redo an eraser stroke", async ({ mount }) => {
    const component = await mount(
      <WithUndoRedoButtons
        id={canvasId}
        undoButtonId={undoButtonId}
        redoButtonId={redoButtonId}
        clearCanvasButtonId={clearCanvasButtonId}
        resetCanvasButtonId={resetCanvasButtonId}
      />,
    );

    const canvas = component.locator(`#${canvasId}`);
    const undoButton = component.locator(`#${undoButtonId}`);
    const redoButton = component.locator(`#${redoButtonId}`);

    await drawLine(canvas, {
      length: 50,
      originX: 0,
      originY: 10,
    });

    await drawEraserLine(canvas, {
      length: 10,
      originX: 0,
      originY: 10,
    });

    await expect(
      component.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(1);

    await expect(
      component.locator(eraserStrokeGroupId).locator("path"),
    ).toHaveCount(1);

    await undoButton.click();

    await expect(
      component.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(1);

    await expect(
      component.locator(eraserStrokeGroupId).locator("path"),
    ).toHaveCount(0);

    await redoButton.click();
    await expect(
      component.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(1);

    await expect(
      component.locator(eraserStrokeGroupId).locator("path"),
    ).toHaveCount(1);
  });
});

test("should still keep the stack on clearCanvas", async ({ mount }) => {
  const component = await mount(
    <WithUndoRedoButtons
      id={canvasId}
      undoButtonId={undoButtonId}
      redoButtonId={redoButtonId}
      clearCanvasButtonId={clearCanvasButtonId}
      resetCanvasButtonId={resetCanvasButtonId}
    />,
  );

  const canvas = component.locator(`#${canvasId}`);
  const undoButton = component.locator(`#${undoButtonId}`);
  const redoButton = component.locator(`#${redoButtonId}`);
  const clearCanvasButton = component.locator(`#${clearCanvasButtonId}`);

  await drawLine(canvas, {
    length: 50,
    originX: 0,
    originY: 10,
  });

  await drawEraserLine(canvas, {
    length: 10,
    originX: 0,
    originY: 10,
  });

  await expect(
    component.locator(firstStrokeGroupId).locator("path"),
  ).toHaveCount(1);

  await expect(
    component.locator(eraserStrokeGroupId).locator("path"),
  ).toHaveCount(1);

  await clearCanvasButton.click();
  await expect(
    component.locator(firstStrokeGroupId).locator("path"),
  ).toHaveCount(0);
  await expect(
    component.locator(eraserStrokeGroupId).locator("path"),
  ).toHaveCount(0);

  // Clear (0) -> Redo (0)
  // Do nothing on redo
  await redoButton.click();
  await expect(
    component.locator(firstStrokeGroupId).locator("path"),
  ).toHaveCount(0);
  await expect(
    component.locator(eraserStrokeGroupId).locator("path"),
  ).toHaveCount(0);

  // Clear (0) -> Undo (2)
  // Reverse the clear on undo
  await undoButton.click();
  await expect(
    component.locator(firstStrokeGroupId).locator("path"),
  ).toHaveCount(1);
  await expect(
    component.locator(eraserStrokeGroupId).locator("path"),
  ).toHaveCount(1);
});

test("should undo a stroke after clear canvas", async ({ mount }) => {
  const component = await mount(
    <WithUndoRedoButtons
      id={canvasId}
      undoButtonId={undoButtonId}
      redoButtonId={redoButtonId}
      clearCanvasButtonId={clearCanvasButtonId}
      resetCanvasButtonId={resetCanvasButtonId}
    />,
  );

  const canvas = component.locator(`#${canvasId}`);
  const undoButton = component.locator(`#${undoButtonId}`);
  const clearCanvasButton = component.locator(`#${clearCanvasButtonId}`);

  await drawLine(canvas, {
    length: 50,
    originX: 0,
    originY: 10,
  });

  await expect(
    component.locator(firstStrokeGroupId).locator("path"),
  ).toHaveCount(1);

  // Clear 1 stroke
  await clearCanvasButton.click();
  await expect(
    component.locator(firstStrokeGroupId).locator("path"),
  ).toHaveCount(0);

  await drawLine(canvas, {
    length: 50,
    originX: 10,
    originY: 10,
  });
  await drawLine(canvas, {
    length: 50,
    originX: 20,
    originY: 10,
  });
  await drawLine(canvas, {
    length: 50,
    originX: 30,
    originY: 10,
  });

  // Undo 1 of 3 new strokes => 2 left
  await undoButton.click();
  await expect(
    component.locator(firstStrokeGroupId).locator("path"),
  ).toHaveCount(2);
});

test("should clear the stack on resetCanvas", async ({ mount }) => {
  const component = await mount(
    <WithUndoRedoButtons
      id={canvasId}
      undoButtonId={undoButtonId}
      redoButtonId={redoButtonId}
      clearCanvasButtonId={clearCanvasButtonId}
      resetCanvasButtonId={resetCanvasButtonId}
    />,
  );

  const canvas = component.locator(`#${canvasId}`);
  const undoButton = component.locator(`#${undoButtonId}`);
  const redoButton = component.locator(`#${redoButtonId}`);
  const resetCanvasButton = component.locator(`#${resetCanvasButtonId}`);

  await drawLine(canvas, {
    length: 50,
    originX: 0,
    originY: 10,
  });

  await drawEraserLine(canvas, {
    length: 10,
    originX: 0,
    originY: 10,
  });

  await expect(
    component.locator(firstStrokeGroupId).locator("path"),
  ).toHaveCount(1);

  await expect(
    component.locator(eraserStrokeGroupId).locator("path"),
  ).toHaveCount(1);

  await resetCanvasButton.click();
  await expect(
    component.locator(firstStrokeGroupId).locator("path"),
  ).toHaveCount(0);
  await expect(
    component.locator(eraserStrokeGroupId).locator("path"),
  ).toHaveCount(0);

  // Clear (0) -> Redo (0)
  // Do nothing on redo
  await redoButton.click();
  await expect(
    component.locator(firstStrokeGroupId).locator("path"),
  ).toHaveCount(0);
  await expect(
    component.locator(eraserStrokeGroupId).locator("path"),
  ).toHaveCount(0);

  // Clear (0) -> Undo (0)
  // Do nothing on undo
  await undoButton.click();
  await expect(
    component.locator(firstStrokeGroupId).locator("path"),
  ).toHaveCount(0);
  await expect(
    component.locator(eraserStrokeGroupId).locator("path"),
  ).toHaveCount(0);
});
