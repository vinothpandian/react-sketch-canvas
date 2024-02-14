import { expect, test } from "@playwright/experimental-ct-react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { drawSquares } from "../commands";

test.use({ viewport: { width: 500, height: 500 } });

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
