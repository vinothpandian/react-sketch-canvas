import { expect, test } from "@playwright/experimental-ct-react";
import { getCanvasIds } from "../commands";
import penStrokes from "../fixtures/penStroke.json";
import penAndEraserStrokes from "../fixtures/penAndEraserStroke.json";
import { WithLoadPathsButton } from "../stories/WithLoadPathsButton.story";

test.use({ viewport: { width: 500, height: 500 } });

const canvasId = "rsc";
const loadPathsButtonId = "load-paths";
const { firstStrokeGroupId, eraserStrokeGroupId } = getCanvasIds(canvasId);

test.describe("loadPaths", () => {
  test("should load path with only pen", async ({ mount }) => {
    const component = await mount(
      <WithLoadPathsButton
        id={canvasId}
        loadPathsButtonId={loadPathsButtonId}
        paths={penStrokes}
      />,
    );

    const canvas = component.locator("svg");
    const loadPathsButton = component.locator(`#${loadPathsButtonId}`);

    await expect(
      canvas.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(0);

    await loadPathsButton.click();

    await expect(
      component.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(1);
  });

  test("should load path with pen and eraser", async ({ mount }) => {
    const component = await mount(
      <WithLoadPathsButton
        id={canvasId}
        loadPathsButtonId={loadPathsButtonId}
        paths={penAndEraserStrokes}
      />,
    );

    const canvas = component.locator("svg");
    const loadPathsButton = component.locator(`#${loadPathsButtonId}`);

    await expect(
      canvas.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(0);

    await loadPathsButton.click();

    await expect(
      component.locator(firstStrokeGroupId).locator("path"),
    ).toHaveCount(1);

    await expect(
      component.locator(eraserStrokeGroupId).locator("path"),
    ).toHaveCount(1);
  });
});
