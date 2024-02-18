import { Locator } from "playwright/test";
import { DrawLineArgs, DrawPointArgs, DrawSquareArgs } from "./types";

export function getCanvasIds(id: string) {
  const canvasBackgroundId = `#${id}__canvas-background`;
  const backgroundImagePatternId = `pattern#${id}__background image`;
  const firstStrokeGroupId = `#${id}__stroke-group-0`;
  const secondStrokeGroupId = `#${id}__stroke-group-1`;
  const eraserStrokeGroupId = `#${id}__eraser-stroke-group`;

  const firstStrokePathId = `#${id}__stroke-group-0__paths__0`;
  const firstEraserStrokeId = `#${id}__eraser-0`;
  const firstEraserMaskId = `${id}__eraser-mask-0`;
  const firstEraserMask = `mask#${firstEraserMaskId}`;
  const secondEraserMaskId = `${id}__eraser-mask-1`;
  const secondEraserMask = `mask#${secondEraserMaskId}`;

  return {
    canvasBackgroundId,
    backgroundImagePatternId,
    firstStrokeGroupId,
    secondStrokeGroupId,
    eraserStrokeGroupId,
    firstStrokePathId,
    firstEraserStrokeId,
    firstEraserMaskId,
    firstEraserMask,
    secondEraserMaskId,
    secondEraserMask,
  };
}

/**
 * Draws a square on a canvas component.
 *
 * @param {Locator} canvas - The locator of the canvas component.
 * @param {DrawSquareArgs} options - The options for drawing the square.
 * @param {number} options.side - The length of each side of the square.
 * @param {number} [options.originX=0] - The x-coordinate of the origin point of the square.
 * @param {number} [options.originY=0] - The y-coordinate of the origin point of the square.
 * @param {string} [options.pointerType="pen"] - The type of pointer used for drawing.
 * @param {number} [options.eventButton=0] - The button pressed during the pointer event.
 * @param {number} [options.eventButtons=1] - The number of buttons pressed during the pointer event.
 * @throws {Error} - If the canvas component is not found.
 * @returns {Promise<void>} - A promise that resolves when the square is drawn.
 */
export async function drawSquare(
  canvas: Locator,
  {
    side,
    originX = 10,
    originY = 10,
    pointerType = "pen",
    eventButton = 0,
    eventButtons = 1,
  }: DrawSquareArgs,
): Promise<void> {
  const boundingBox = await canvas.boundingBox();

  if (!boundingBox) {
    throw new Error("Canvas not found");
  }

  const x = boundingBox.x + originX;
  const y = boundingBox.y + originY;

  await canvas.dispatchEvent("pointerdown", {
    pointerType,
    button: eventButton,
    buttons: eventButtons,
    clientX: x,
    clientY: y,
  });

  await canvas.dispatchEvent("pointermove", {
    pointerType,
    button: eventButton,
    buttons: eventButtons,
    clientX: x,
    clientY: y + side,
  });
  await canvas.dispatchEvent("pointermove", {
    pointerType,
    button: eventButton,
    buttons: eventButtons,
    clientX: x + side,
    clientY: y + side,
  });
  await canvas.dispatchEvent("pointermove", {
    pointerType,
    button: eventButton,
    buttons: eventButtons,
    clientX: x + side,
    clientY: y,
  });
  await canvas.dispatchEvent("pointermove", {
    pointerType,
    button: eventButton,
    buttons: eventButtons,
    clientX: x,
    clientY: y,
  });
  await canvas.dispatchEvent("pointerup", {
    pointerType,
    button: eventButton,
    buttons: eventButtons,
  });
}

/**
 * Draws a square on a canvas component multiple times.
 *
 * @param {Locator} component - The locator of the canvas component.
 * @param {number} [count=3] - The number of squares to draw.
 * @param {"pen" | "mouse" | "touch"} [staticPointerType] - The type of pointer used for drawing.
 *  If not provided, the pointer type will alternate between "pen", "mouse", and "touch".
 * @returns {Promise<void>} - A promise that resolves when all squares are drawn.
 */
export async function drawSquares(
  component: Locator,
  count: number = 3,
  staticPointerType?: "pen" | "mouse" | "touch",
): Promise<void> {
  const pointerTypes = ["pen", "mouse", "touch"] as const;

  await Array.from({ length: count }, (_, i) => i).reduce(
    async (promise, i) => {
      await promise;
      return drawSquare(component, {
        side: 100,
        pointerType: staticPointerType || pointerTypes[i % pointerTypes.length],
        originX: 50 + i * 50,
      });
    },
    Promise.resolve(),
  );
}

/**
 * Draws a line on a canvas element.
 *
 * @param {Locator} canvas - The canvas element to draw on.
 * @param {DrawLineArgs} options - The options for drawing the line.
 * @param {number} options.length - The length of the line.
 * @param {number} [options.originX=0] - The x-coordinate of the line's origin.
 * @param {number} [options.originY=0] - The y-coordinate of the line's origin.
 * @param {string} [options.pointerType="pen"] - The type of pointer used for drawing.
 * @param {number} [options.eventButton=0] - The button used for the pointer event.
 * @param {number} [options.eventButtons=1] - The buttons used for the pointer event.
 * @throws {Error} Throws an error if the canvas element is not found.
 * @returns {Promise<void>} A promise that resolves when the line is drawn.
 */
export async function drawLine(
  canvas: Locator,
  {
    length,
    originX = 0,
    originY = 0,
    pointerType = "pen",
    eventButton = 0,
    eventButtons = 1,
  }: DrawLineArgs,
): Promise<void> {
  const boundingBox = await canvas.boundingBox();

  if (!boundingBox) {
    throw new Error("Canvas not found");
  }

  const x = boundingBox.x + originX;
  const y = boundingBox.y + originY;

  await canvas.dispatchEvent("pointerdown", {
    pointerType,
    button: eventButton,
    buttons: eventButtons,
    clientX: x,
    clientY: y,
  });

  await canvas.dispatchEvent("pointermove", {
    pointerType,
    button: eventButton,
    buttons: eventButtons,
    clientX: x + length,
    clientY: y + length,
  });

  await canvas.dispatchEvent("pointerup", {
    pointerType,
    button: eventButton,
    buttons: eventButtons,
  });
}

/**
 * Draw eraser lines on a canvas element.
 *
 * @param {Locator} canvas - The canvas element to draw on.
 * @param {DrawLineArgs} options - The options for drawing the eraser lines.
 * @param {number} options.length - The length of the eraser line.
 * @param {number} [options.originX=0] - The x-coordinate of the eraser line's origin.
 * @param {number} [options.originY=0] - The y-coordinate of the eraser line's origin.
 * @param {string} [options.pointerType="pen"] - The type of pointer used for drawing.
 * @param {number} [options.eventButton=0] - The button used for the pointer event.
 * @throws {Error} Throws an error if the canvas element is not found.
 * @returns {Promise<void>} A promise that resolves when the eraser lines are drawn.
 */
export async function drawEraserLine(
  canvas: Locator,
  {
    length,
    originX = 0,
    originY = 0,
    pointerType = "pen",
    eventButton = 0,
  }: Omit<DrawLineArgs, "eventButtons">,
): Promise<void> {
  const boundingBox = await canvas.boundingBox();

  if (!boundingBox) {
    throw new Error("Canvas not found");
  }

  const x = boundingBox.x + originX;
  const y = boundingBox.y + originY;

  await canvas.dispatchEvent("pointerdown", {
    pointerType,
    button: eventButton,
    buttons: 32, // Windows surface pen eraser button
    clientX: x,
    clientY: y,
  });

  await canvas.dispatchEvent("pointermove", {
    pointerType,
    button: eventButton,
    buttons: 32, // Windows surface pen eraser button
    clientX: x + length,
    clientY: y + length,
  });

  await canvas.dispatchEvent("pointerup", {
    pointerType,
    button: eventButton,
    buttons: 32, // Windows surface pen eraser button
  });
}

/**
 * Draws a point on a canvas element.
 *
 * @param {Locator} canvas - The canvas element to draw on.
 * @param {DrawLineArgs} options - The options for drawing the point.
 * @param {number} [options.originX=0] - The x-coordinate of the point's origin.
 * @param {number} [options.originY=0] - The y-coordinate of the point's origin.
 * @param {string} [options.pointerType="pen"] - The type of pointer used for drawing.
 * @param {number} [options.eventButton=0] - The button used for the pointer event.
 * @param {number} [options.eventButtons=1] - The buttons used for the pointer event.
 * @throws {Error} Throws an error if the canvas element is not found.
 * @returns {Promise<void>} A promise that resolves when the point is drawn.
 */
export async function drawPoint(
  canvas: Locator,
  {
    originX = 0,
    originY = 0,
    pointerType = "pen",
    eventButton = 0,
    eventButtons = 1,
  }: DrawPointArgs,
): Promise<void> {
  const boundingBox = await canvas.boundingBox();

  if (!boundingBox) {
    throw new Error("Canvas not found");
  }

  const x = boundingBox.x + originX;
  const y = boundingBox.y + originY;

  await canvas.dispatchEvent("pointerdown", {
    pointerType,
    button: eventButton,
    buttons: eventButtons,
    clientX: x,
    clientY: y,
  });

  await canvas.dispatchEvent("pointerup", {
    pointerType,
    button: eventButton,
    buttons: eventButtons,
  });
}

/**
 * Converts a data URI to kilobytes.
 *
 * @param {string} dataURI - The data URI to convert.
 * @returns {number} - The size of the data URI in kilobytes.
 */
export function convertDataURItoKiloBytes(dataURI?: string): number {
  if (!dataURI) {
    return 0;
  }

  const base64str = dataURI.split("base64,")[1];
  const decoded = atob(base64str);

  return decoded.length / 1024;
}
