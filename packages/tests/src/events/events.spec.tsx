import { expect, test } from "@playwright/experimental-ct-react";
import { CanvasPath, ReactSketchCanvas } from "react-sketch-canvas";
import { drawLine } from "../commands";
import { WithEraserButton } from "../stories/WithEraserButton.story";

test.use({ viewport: { width: 500, height: 500 } });

test.describe("onChange event", () => {
  test("should call onChange when a new stroke is added", async ({ mount }) => {
    let paths: CanvasPath[] = [];
    const handleChange = (updatedPaths: CanvasPath[]) => {
      paths = [...updatedPaths];
    };

    const canvasId = "rsc";

    const component = await mount(
      <ReactSketchCanvas id={canvasId} onChange={handleChange} />,
    );

    const canvas = component.locator(`#${canvasId}`);

    await drawLine(canvas, {
      length: 50,
      originX: 0,
      originY: 10,
    });

    expect(paths).toHaveLength(1);
    expect(paths.at(0)?.drawMode).toBe(true);
  });

  test("should call onChange when a eraser stroke is added", async ({
    mount,
  }) => {
    let paths: CanvasPath[] = [];
    const handleChange = (updatedPaths: CanvasPath[]) => {
      paths = [...updatedPaths];
    };

    const canvasId = "rsc";
    const eraserButtonId = "eraser-button";
    const component = await mount(
      <WithEraserButton
        id={canvasId}
        eraserButtonId={eraserButtonId}
        onChange={handleChange}
      />,
    );

    const canvas = component.locator(`#${canvasId}`);

    await drawLine(canvas, {
      length: 50,
      originX: 0,
      originY: 10,
    });

    expect(paths).toHaveLength(1);
    expect(paths.at(0)?.drawMode).toBe(true);

    await component.locator(`#${eraserButtonId}`).click();
    await drawLine(canvas, {
      length: 10,
      originX: 0,
      originY: 10,
    });

    expect(paths).toHaveLength(2);
    expect(paths.at(1)?.drawMode).toBe(false);
  });
});

test.describe("onStroke event", () => {
  test("should call onStroke when a new stroke is added", async ({ mount }) => {
    let lastPath: CanvasPath | null = null;
    let isLastStrokeByEraser: boolean | null = null;
    const handleStroke = (path: CanvasPath, isEraser: boolean) => {
      lastPath = { ...path };
      isLastStrokeByEraser = isEraser;
    };

    const canvasId = "rsc";

    const component = await mount(
      <ReactSketchCanvas id={canvasId} onStroke={handleStroke} />,
    );

    const canvas = component.locator(`#${canvasId}`);

    await drawLine(canvas, {
      length: 50,
      originX: 0,
      originY: 10,
    });

    expect(lastPath).toBeDefined();
    expect(isLastStrokeByEraser).toBe(false);
  });

  test("should call onStroke when a eraser stroke is added", async ({
    mount,
  }) => {
    let lastPath: CanvasPath | null = null;
    let isLastStrokeByEraser: boolean | null = null;
    const handleStroke = (path: CanvasPath, isEraser: boolean) => {
      lastPath = { ...path };
      isLastStrokeByEraser = isEraser;
    };

    const canvasId = "rsc";
    const eraserButtonId = "eraser-button";
    const component = await mount(
      <WithEraserButton
        id={canvasId}
        eraserButtonId={eraserButtonId}
        onStroke={handleStroke}
      />,
    );

    const canvas = component.locator(`#${canvasId}`);

    await drawLine(canvas, {
      length: 50,
      originX: 0,
      originY: 10,
    });

    await component.locator(`#${eraserButtonId}`).click();
    await drawLine(canvas, {
      length: 10,
      originX: 0,
      originY: 10,
    });

    expect(lastPath).toBeDefined();
    expect(isLastStrokeByEraser).toBe(true);
  });
});
