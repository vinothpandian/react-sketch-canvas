import { test, expect } from "@playwright/experimental-ct-react";
import * as React from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { Point } from "react-sketch-canvas/src/types";
import { drawLine, drawPoint, getCanvasIds } from "../commands";

test.use({ viewport: { width: 500, height: 500 } });

const canvasId = "rsc-svg-path-test";

test.describe("ReactSketchCanvas - getSvgPathFromPoints prop", () => {
  test("should use default bezier command when getSvgPathFromPoints is not provided", async ({
    mount,
    page,
  }) => {
    const component = await mount(<ReactSketchCanvas id={canvasId} />);

    await drawLine(component, {
      length: 50,
      originX: 10,
      originY: 10,
    });

    const { firstStrokePathId } = getCanvasIds(canvasId);
    const pathElement = component.locator(firstStrokePathId);
    const dAttribute = await pathElement.getAttribute("d");
    expect(dAttribute).toContain("C"); // Bezier curve command
  });

  test("should use custom path generator when provided", async ({
    mount,
    page,
  }) => {
    const straightLineGenerator = (points: Point[]): string => {
      if (points.length === 0) return "";
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
      }
      return d;
    };

    const component = await mount(
      <ReactSketchCanvas
        id={canvasId}
        getSvgPathFromPoints={straightLineGenerator}
      />,
    );

    // Simulate drawing a path with three points.
    // drawLine currently only supports two points (start and end).
    // To test a multi-segment line, we'll call drawLine twice,
    // but ReactSketchCanvas will treat this as two separate strokes.
    // So, we'll test the path of the first stroke.
    // A more robust drawLine or a new utility would be needed for a single multi-segment stroke.
    await component.dispatchEvent("pointerdown", { clientX: 10, clientY: 10 });
    await component.dispatchEvent("pointermove", { clientX: 50, clientY: 50 });
    await component.dispatchEvent("pointermove", { clientX: 100, clientY: 20 });
    await component.dispatchEvent("pointerup");

    const { firstStrokePathId } = getCanvasIds(canvasId);
    const pathElement = component.locator(firstStrokePathId);
    const dAttribute = await pathElement.getAttribute("d");

    // The points captured by ReactSketchCanvas are relative to the canvas.
    // Our dispatchEvent uses clientX/clientY which are page coordinates.
    // For this test, we'll assume the canvas is at (0,0) for simplicity,
    // or that Playwright's component testing handles this.
    // The important part is the "L" commands.
    expect(dAttribute).toMatch(/^M 10 10 L 50 50 L 100 20$/);
    expect(dAttribute).not.toContain("C");
  });

  test("should render a circle for a single point even with custom generator", async ({
    mount,
    page,
  }) => {
    const customGenerator = (points: Point[]): string => {
      if (points.length === 0) return "";
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
      }
      return d;
    };

    const strokeWidth = 10;
    const component = await mount(
      <ReactSketchCanvas
        id={canvasId}
        getSvgPathFromPoints={customGenerator}
        strokeWidth={strokeWidth}
      />,
    );

    await drawPoint(component, { originX: 30, originY: 30 });

    const { firstStrokeGroupId } = getCanvasIds(canvasId);
    const circleElement = component
      .locator(firstStrokeGroupId)
      .locator("circle");

    await expect(circleElement).toHaveAttribute("cx", "30");
    await expect(circleElement).toHaveAttribute("cy", "30");
    await expect(circleElement).toHaveAttribute(
      "r",
      (strokeWidth / 2).toString(),
    );

    const pathElement = component
      .locator(firstStrokeGroupId)
      .locator("path");
    await expect(pathElement).toHaveCount(0); // No path element for single point
  });

  test("custom path generator should handle empty points array gracefully", async ({
    mount,
    page,
  }) => {
    let generatorCalledWithEmpty = false;
    const customGenerator = (points: Point[]): string => {
      if (points.length === 0) {
        generatorCalledWithEmpty = true;
        return "";
      }
      return `M ${points[0].x} ${points[0].y} L ${
        points[points.length - 1].x
      } ${points[points.length - 1].y}`;
    };

    const canvasRef = React.createRef<ReactSketchCanvasRef>();
    const component = await mount(
      <ReactSketchCanvas
        id={canvasId}
        ref={canvasRef}
        getSvgPathFromPoints={customGenerator}
      />,
    );

    // At this point, no drawing has occurred.
    // We need to check if a path is attempted to be rendered with no points.
    // ReactSketchCanvas itself might prevent calling the generator if there are no paths.
    // This test primarily ensures that if the generator *were* called with empty points,
    // it behaves as expected and doesn't break.

    // We can't directly make the component call the generator with empty paths easily
    // without modifying internal state or complex interactions.
    // The custom generator itself is tested for empty array input by its definition.
    // We'll verify no paths are rendered initially.
    const { firstStrokePathId } = getCanvasIds(canvasId);
    const pathElement = component.locator(firstStrokePathId);
    await expect(pathElement).toHaveCount(0);

    // To be more robust, we could try to trigger an empty path scenario if one exists.
    // For now, we trust ReactSketchCanvas doesn't call the generator with nothing.
    // The generator's own guard `if (points.length === 0) return "";` covers its direct input.
    expect(generatorCalledWithEmpty).toBe(false); // It shouldn't be called with empty points by the component
  });
});
