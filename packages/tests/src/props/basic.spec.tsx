import { expect, test } from "@playwright/experimental-ct-react";
import { ReactSketchCanvas, CanvasPath } from "react-sketch-canvas";
import { drawLine, getCanvasIds } from "../commands";
import { WithEraserButton } from "../stories/WithEraserButton.story";

test.use({ viewport: { width: 500, height: 500 } });

test("should update width from props", async ({ mount }) => {
  const component = await mount(<ReactSketchCanvas width="100px" />);

  await expect(component).toHaveAttribute("style", /width: 100px;/i);
});

test("should update height from props", async ({ mount }) => {
  const component = await mount(<ReactSketchCanvas height="100px" />);

  await expect(component).toHaveAttribute("style", /height: 100px;/i);
});

test("should update classname from props", async ({ mount }) => {
  const component = await mount(<ReactSketchCanvas className="svg-canvas" />);

  await expect(component).toHaveClass("svg-canvas");
});

test("should update backgroundImage from props", async ({ mount }) => {
  const canvasId = "rsc";
  const backgroundImageUrl = "https://placehold.co/600x400.png";
  const component = await mount(
    <ReactSketchCanvas id={canvasId} backgroundImage={backgroundImageUrl} />,
  );

  const { canvasBackgroundId, backgroundImagePatternId } =
    getCanvasIds(canvasId);

  await expect(component.locator(canvasBackgroundId)).toHaveAttribute(
    "fill",
    `url(#${canvasId}__background)`,
  );

  await expect(component.locator(backgroundImagePatternId)).toHaveAttribute(
    "xlink:href",
    backgroundImageUrl,
  );
});

test("should update preserveAspectRatio of the background image from props", async ({
  mount,
}) => {
  const canvasId = "rsc";
  const backgroundImageUrl = "https://placehold.co/600x400.png";
  const preserveAspectRatio = "xMidYMid meet";
  const component = await mount(
    <ReactSketchCanvas
      id={canvasId}
      backgroundImage={backgroundImageUrl}
      preserveBackgroundImageAspectRatio={preserveAspectRatio}
    />,
  );

  const { backgroundImagePatternId } = getCanvasIds(canvasId);

  await expect(component.locator(backgroundImagePatternId)).toHaveAttribute(
    "preserveAspectRatio",
    preserveAspectRatio,
  );
});

test("should update stroke width", async ({ mount }) => {
  const canvasId = "rsc";
  const strokeWidth = 24;

  const component = await mount(
    <ReactSketchCanvas id={canvasId} strokeWidth={strokeWidth} />,
  );

  await drawLine(component, { length: 100, originX: 100, originY: 100 });

  const { firstStrokeGroupId } = getCanvasIds(canvasId);

  await expect(
    component.locator(firstStrokeGroupId).locator("path").last(),
  ).toHaveAttribute("stroke-width", strokeWidth.toString());
});

test("should update eraser width", async ({ mount }) => {
  const canvasId = "rsc";
  const eraserButtonId = "eraser-button";
  const strokeWidth = 16;
  const eraserWidth = 24;

  const component = await mount(
    <WithEraserButton
      eraserButtonId={eraserButtonId}
      id={canvasId}
      strokeWidth={strokeWidth}
      eraserWidth={eraserWidth}
    />,
  );

  const canvas = component.locator(`#${canvasId}`);

  // Draw a line
  await drawLine(canvas, { length: 10, originX: 100, originY: 100 });

  await component.locator(`#${eraserButtonId}`).click();

  // Erase the line
  await drawLine(canvas, { length: 5, originX: 100, originY: 100 });

  const { firstStrokeGroupId, eraserStrokeGroupId } = getCanvasIds(canvasId);

  await expect(
    canvas.locator(firstStrokeGroupId).locator("path").first(),
  ).toHaveAttribute("stroke-width", strokeWidth.toString());

  await expect(
    canvas.locator(eraserStrokeGroupId).locator("path").first(),
  ).toHaveAttribute("stroke-width", eraserWidth.toString());
});

test("should update stroke color", async ({ mount }) => {
  const canvasId = "rsc";
  const strokeColor = "green";

  const component = await mount(
    <ReactSketchCanvas id={canvasId} strokeColor={strokeColor} />,
  );

  await drawLine(component, { length: 100, originX: 100, originY: 100 });

  const { firstStrokeGroupId } = getCanvasIds(canvasId);

  await expect(
    component.locator(firstStrokeGroupId).locator("path").last(),
  ).toHaveAttribute("stroke", strokeColor);
});

test("should update canvas color", async ({ mount }) => {
  const canvasId = "rsc";
  const canvasColor = "green";

  const component = await mount(
    <ReactSketchCanvas id={canvasId} canvasColor={canvasColor} />,
  );

  const { canvasBackgroundId } = getCanvasIds(canvasId);

  await expect(component.locator(canvasBackgroundId)).toHaveAttribute(
    "fill",
    canvasColor,
  );
});

test("should update style from props", async ({ mount }) => {
  const canvasId = "rsc";
  const style = {
    border: "10px solid rgb(255, 0, 0)",
    outline: "10px solid rgb(0, 255, 0)",
  };

  const component = await mount(
    <ReactSketchCanvas id={canvasId} style={style} />,
  );

  await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  await expect(component).toHaveCSS("border-width", "10px");
  await expect(component).toHaveCSS("border-style", "solid");

  await expect(component).toHaveCSS("outline-color", "rgb(0, 255, 0)");
  await expect(component).toHaveCSS("outline-width", "10px");
  await expect(component).toHaveCSS("outline-style", "solid");
});

test("should update svg style from props", async ({ mount }) => {
  const canvasId = "rsc";
  const svgStyle = {
    backgroundColor: "rgb(255, 0, 0)",
  };

  const component = await mount(
    <ReactSketchCanvas id={canvasId} svgStyle={svgStyle} />,
  );

  await expect(component.locator("svg")).toHaveCSS(
    "background-color",
    "rgb(255, 0, 0)",
  );
});

test("should provide sketching time when withTimestamp is disabled", async ({
  mount,
}) => {
  let paths: CanvasPath[] = [];

  const handleChange = (updatedPaths: CanvasPath[]) => {
    paths = [...updatedPaths];
  };

  const component = await mount(
    <ReactSketchCanvas withTimestamp onChange={handleChange} />,
  );

  await drawLine(component, { length: 50, originX: 0, originY: 10 });

  expect(paths.at(0)?.endTimestamp).not.toBeUndefined();
});

test("should not contain sketching time when withTimestamp is disabled", async ({
  mount,
}) => {
  let paths: CanvasPath[] = [];

  const handleChange = (updatedPaths: CanvasPath[]) => {
    paths = [...updatedPaths];
  };

  const component = await mount(
    <ReactSketchCanvas withTimestamp={false} onChange={handleChange} />,
  );

  await drawLine(component, { length: 50, originX: 0, originY: 10 });

  expect(paths.at(0)?.endTimestamp).toBeUndefined();
});
