import * as React from "react";
import {
  CanvasPath,
  ExportImageOptions,
  ExportImageType,
  Point,
} from "../types";

/**
 * The pointer type to allow drawing with.
 *
 */
export type AllowOnlyPointerType = "all" | "pen" | "mouse" | "touch";

/**
 * Canvas component props.
 */
export interface CanvasProps {
  /**
   * Array of paths to be drawn on the canvas
   */
  paths: CanvasPath[];
  /**
   * Whether the user is currently drawing
   */
  isDrawing: boolean;
  /**
   * Callback to be called when the user starts drawing.
   * This is triggered when the user presses the mouse button or touches the canvas
   * with a pen or a touch screen.
   *
   * @param point - The point where the user started drawing
   * @param isEraser - Whether the user is using the eraser
   * @returns void
   */
  onPointerDown: (point: Point, isEraser?: boolean) => void;
  /**
   * Callback to be called when the user is drawing.
   * This is triggered when the user moves the mouse or pen or finger on the canvas.
   *
   * @param point - The point where the user is currently drawing
   * @param isEraser - Whether the user is using the eraser
   * @returns void
   */
  onPointerMove: (point: Point) => void;
  /**
   * Callback to be called when the user stops drawing.
   * This is triggered when the user releases the mouse button or lifts the pen or finger from the canvas.
   * @returns void
   */
  onPointerUp: () => void;
  /**
   * The pointer type to allow drawing with.
   * @defaultValue all
   */
  allowOnlyPointerType: AllowOnlyPointerType;
  /**
   * Background image to be displayed on the canvas.
   * This can be a URL or a base64 encoded image.
   * @defaultValue No background image is displayed
   */
  backgroundImage: string;
  /**
   * Background color of the canvas.
   * @defaultValue white
   */
  canvasColor: string;
  /**
   * Class name to be applied to the canvas.
   * @defaultValue react-sketch-canvas
   */
  className?: string;
  /**
   * Whether the canvas should be exported with the background image.
   * @defaultValue false
   */
  exportWithBackgroundImage: boolean;
  /**
   * Height of the canvas.
   * @defaultValue 100%
   */
  height: string;
  /**
   * ID of the canvas.
   * @defaultValue the ID is `react-sketch-canvas`
   */
  id?: string;
  /**
   * Set aspect ratio of the background image. For possible values check MDN docs
   * @link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
   */
  preserveBackgroundImageAspectRatio?: React.SVGAttributes<HTMLImageElement>["preserveAspectRatio"];
  /**
   * Style to be applied to the canvas.
   * @defaultValue No style is applied.
   */
  style: React.CSSProperties;
  /**
   * Style to be applied to the SVG.
   * @defaultValue No style is applied.
   */
  svgStyle: React.CSSProperties;
  /**
   * Whether the canvas should be exported with the viewBox.
   * @defaultValue false
   */
  withViewBox?: boolean;
  /**
   * Width of the canvas.
   * @defaultValue 100%
   */
  width: string;
  /**
   * Whether the canvas is read-only. This disables drawing on the canvas.
   * @defaultValue false
   */
  readOnly?: boolean;
  /**
   * Throttle time for pointer move events in milliseconds.
   * @defaultValue 0
   */
  throttleTime?: number;
  /**
   * Function to convert points to SVG path.
   * @defaultValue A function that converts points to SVG path.
   */
  getSvgPathFromPoints?: (points: Point[]) => string;
}

/**
 * Canvas component ref
 */
export interface CanvasRef {
  /**
   * Export the canvas as an image.
   * This returns a promise that resolves to a data URL of the image.
   *
   * @param imageType - The type of image to be exported.
   * @param options - Options to be applied to the exported image.
   * @returns A promise that resolves to a data URL of the image.
   */
  exportImage: (
    imageType: ExportImageType,
    options?: ExportImageOptions,
  ) => Promise<string>;
  /**
   * Export the canvas as an SVG.
   * This returns a promise that resolves to a string of the SVG.
   *
   * @returns A promise that resolves to a string of the SVG.
   */
  exportSvg: () => Promise<string>;
}
