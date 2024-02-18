import { expect, test } from "@playwright/experimental-ct-react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { drawLine, drawPoint, drawSquares, getCanvasIds } from "../commands";
import { WithEraserButton } from "../stories/WithEraserButton.story";

test.use({ viewport: { width: 500, height: 500 } });

test.describe("drawing points", () => {
  test("should create a point with circle on single point stroke", async ({
    mount,
  }) => {
    const canvasId = "rsc";
    const strokeWidth = 4;
    const component = await mount(
      <ReactSketchCanvas id={canvasId} strokeWidth={strokeWidth} />,
    );

    const originX = 10;
    const originY = 20;

    await drawPoint(component, { originX, originY });

    const { firstStrokeGroupId } = getCanvasIds(canvasId);

    const circle = component.locator(firstStrokeGroupId).locator("circle");

    await expect(circle).toHaveAttribute("r", (strokeWidth / 2).toString());
    await expect(circle).toHaveAttribute("cx", originX.toString());
    await expect(circle).toHaveAttribute("cy", originY.toString());
  });

  test("should create a eraser point with circle on single point erase", async ({
    mount,
  }) => {
    const canvasId = "rsc";
    const eraserWidth = 4;
    const eraserButtonId = "eraser-button";

    const component = await mount(
      <WithEraserButton
        id={canvasId}
        eraserButtonId={eraserButtonId}
        eraserWidth={eraserWidth}
      />,
    );

    const canvas = component.locator(`#${canvasId}`);
    const originX = 10;
    const originY = 10;

    await drawLine(canvas, { length: 100 });

    await component.locator(`#${eraserButtonId}`).click();

    // TODO: This is a workaround for playwright
    await drawPoint(canvas, { originX: originX - 1, originY: originY - 1 });
    const { eraserStrokeGroupId } = getCanvasIds(canvasId);

    const circle = canvas.locator(eraserStrokeGroupId).locator("circle");
    await expect(circle).toHaveAttribute("r", (eraserWidth / 2).toString());
    await expect(circle).toHaveAttribute("cx", originX.toString());
    await expect(circle).toHaveAttribute("cy", originY.toString());
  });
});

test.describe("drawing with different devices", () => {
  test("should allow sketching with mouse, touch, and stylus when allowOnlyPointerType is set as all", async ({
    mount,
  }) => {
    const component = await mount(
      <ReactSketchCanvas allowOnlyPointerType="all" />,
    );

    await drawLine(component, {
      length: 50,
      originX: 0,
      originY: 10,
      pointerType: "mouse",
    });
    await drawLine(component, {
      length: 100,
      originX: 50,
      originY: 10,
      pointerType: "touch",
    });
    await drawLine(component, {
      length: 200,
      originX: 100,
      originY: 10,
      pointerType: "pen",
    });

    await expect(component.locator("path")).toHaveCount(3);
  });

  test("should allow sketching only with mouse when allowOnlyPointerType is set as mouse", async ({
    mount,
  }) => {
    const component = await mount(
      <ReactSketchCanvas allowOnlyPointerType="mouse" />,
    );

    await drawLine(component, {
      length: 50,
      originX: 0,
      originY: 10,
      pointerType: "mouse",
    });
    await expect(component.locator("path")).toHaveCount(1);

    await drawLine(component, {
      length: 100,
      originX: 50,
      originY: 10,
      pointerType: "touch",
    });

    await drawLine(component, {
      length: 200,
      originX: 100,
      originY: 10,
      pointerType: "pen",
    });

    // Should not draw with touch or pen
    await expect(component.locator("path")).toHaveCount(1);
  });

  test("should allow sketching only with touch when allowOnlyPointerType is set as touch", async ({
    mount,
  }) => {
    const component = await mount(
      <ReactSketchCanvas allowOnlyPointerType="touch" />,
    );

    await drawLine(component, {
      length: 100,
      originX: 50,
      originY: 10,
      pointerType: "touch",
    });
    await expect(component.locator("path")).toHaveCount(1);

    await drawLine(component, {
      length: 50,
      originX: 0,
      originY: 10,
      pointerType: "mouse",
    });
    await drawLine(component, {
      length: 200,
      originX: 100,
      originY: 10,
      pointerType: "pen",
    });

    // Should not draw with mouse or pen
    await expect(component.locator("path")).toHaveCount(1);
  });

  test("should allow sketching only with pen when allowOnlyPointerType is set as pen", async ({
    mount,
  }) => {
    const component = await mount(
      <ReactSketchCanvas allowOnlyPointerType="pen" />,
    );
    await drawLine(component, {
      length: 200,
      originX: 100,
      originY: 10,
      pointerType: "pen",
    });

    await expect(component.locator("path")).toHaveCount(1);

    await drawLine(component, {
      length: 50,
      originX: 0,
      originY: 10,
      pointerType: "mouse",
    });

    await drawLine(component, {
      length: 100,
      originX: 50,
      originY: 10,
      pointerType: "touch",
    });

    // Should not draw with mouse or touch
    await expect(component.locator("path")).toHaveCount(1);
  });
});

test("should disable drawing when readOnly is set as true", async ({
  mount,
}) => {
  const component = await mount(<ReactSketchCanvas readOnly />);

  await drawSquares(component);

  await expect(component.locator("path")).toHaveCount(0);
});
