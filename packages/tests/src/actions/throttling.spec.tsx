import { expect, test } from "@playwright/experimental-ct-react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { drawLine } from "../commands";

test.use({ viewport: { width: 500, height: 500 } });

test.describe("throttling", () => {
  test("should throttle pointer move events to 20ms", async ({ mount }) => {
    const canvasId = "rsc";
    const component = await mount(
      <ReactSketchCanvas id={canvasId} throttleTime={20} />,
    );

    const canvas = component.locator(`#${canvasId}`);

    // Add assertions to verify throttling behavior
    // For example, you can check the number of recorded points
    // and ensure it is less than the number of points recorded without throttling
  });

  test("should not throttle pointer move events when throttleTime is 0", async ({
    mount,
  }) => {
    const canvasId = "rsc";
    const component = await mount(
      <ReactSketchCanvas id={canvasId} throttleTime={0} />,
    );

    const canvas = component.locator(`#${canvasId}`);

    await drawLine(canvas, {
      length: 50,
      originX: 0,
      originY: 10,
    });

    // Add assertions to verify no throttling behavior
    // For example, you can check the number of recorded points
    // and ensure it is equal to the number of points recorded without throttling
  });
});
