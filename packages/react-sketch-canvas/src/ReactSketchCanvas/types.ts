/* Props validation */
import { CanvasProps, CanvasRef } from "../Canvas/types";
import { CanvasPath } from "../types";

/**
 * React Sketch Canvas component props.
 *
 * @remarks
 * This is an extension of the CanvasProps with additional props specific to the React Sketch Canvas component.
 */
export interface ReactSketchCanvasProps
  extends Partial<
    Omit<
      CanvasProps,
      "paths" | "isDrawing" | "onPointerDown" | "onPointerMove" | "onPointerUp"
    >
  > {
  /**
   * Width of the eraser.
   * @remarks This is only applicable when the eraseMode is set to true.
   *
   * @defaultValue 8
   */
  eraserWidth?: number;
  /**
   * Optional callback that is called when the user starts drawing.
   * This is triggered when the user when user creates a stroke on the canvas
   * with a pen or an eraser.
   *
   * @param updatedPaths - The updated paths drawn on the canvas
   */
  onChange?: (updatedPaths: CanvasPath[]) => void;
  /**
   * Optional callback that is called when the user creates a stroke on the canvas
   * with a pen or an eraser.
   *
   * @param path - The path drawn on the canvas
   * @param isEraser - Whether the user is using the eraser
   */
  onStroke?: (path: CanvasPath, isEraser: boolean) => void;
  /**
   * Color of the stroke.
   *
   * @remarks This is only applicable when the eraseMode is set to false.
   *
   * @defaultValue "red"
   */
  strokeColor?: string;
  /**
   * Width of the stroke.
   *
   * @remarks This is only applicable when the eraseMode is set to false.
   *
   * @defaultValue 4
   */
  strokeWidth?: number;
  /**
   * Whether to record the timestamp of the drawing. This will be stored in
   * the CanvasPath object in milliseconds. This can be used to calculate the time taken to draw
   * on the canvas.
   *
   * @remarks
   * use getSketchingTime method to get the time taken to draw on the canvas.
   *
   * @defaultValue false
   */
  withTimestamp?: boolean;
  /**
   * Throttle time for pointer move events in milliseconds.
   * @defaultValue 0
   */
  throttleTime?: number;
}

/**
 * React Sketch Canvas component ref.
 *
 * @remarks
 * This is an extension of the CanvasRef with additional methods specific to the React Sketch Canvas component.
 */
export interface ReactSketchCanvasRef extends CanvasRef {
  /**
   * Set the drawing mode to either draw or erase
   *
   * @param erase - Whether to set the mode to erase
   */
  eraseMode: (erase: boolean) => void;
  /**
   * Clear the canvas. This will remove all the paths drawn on the canvas.
   * But it will not clear the Undo/Redo stack.
   *
   * @remarks To clear the Undo/Redo stack, use the resetCanvas method.
   */
  clearCanvas: () => void;
  /**
   * Undo the last drawn path
   */
  undo: () => void;
  /**
   * Redo the last undone path
   */
  redo: () => void;
  /**
   * Export the paths draw on the canvas as a JSON object with list of CanvasPaths
   *
   * @returns Promise<CanvasPath[]> - The paths drawn on the canvas
   */
  exportPaths: () => Promise<CanvasPath[]>;
  /**
   * Import the paths to be drawn on the canvas.
   *
   * @remarks
   * This will remove all the existing paths on the canvas and replace them with the new paths.
   *
   * @param paths - The paths to be drawn on the canvas
   */
  loadPaths: (paths: CanvasPath[]) => void;
  /**
   * Get the current drawing time in milliseconds. This will only work if withTimestamp prop is set to true.
   *
   * @remarks
   * This does not include the idle time when the user is not drawing. It only includes the time when the user is drawing on the canvas.
   */
  getSketchingTime: () => Promise<number>;
  /**
   * Reset the canvas. This will remove all the paths drawn on the canvas and clear the Undo/Redo stack.
   *
   * @remarks
   * If you only want to clear the paths drawn on the canvas, use the clearCanvas method.
   */
  resetCanvas: () => void;
}
