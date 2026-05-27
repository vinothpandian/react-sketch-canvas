import type { CanvasProps, CanvasRef } from "../Canvas/types";
import type { CanvasPath } from "../types";

/**
 * Eraser behavior used for pointer erasing.
 *
 * @remarks
 * `"mask"` stores eraser gestures as mask paths, preserving the historical
 * export and undo/redo behavior. `"stroke"` removes whole drawing strokes
 * touched by the eraser gesture instead of storing the gesture path.
 *
 * @public
 */
export type EraserMode = "mask" | "stroke";

/**
 * Props for the stateful {@link ReactSketchCanvas} component.
 *
 * @remarks
 * `ReactSketchCanvas` composes the low-level {@link CanvasProps} with drawing
 * state management. You can pass sizing, styling, background, pointer, and
 * export props from `CanvasProps`; path state and pointer callbacks are managed
 * internally by the component.
 *
 * @public
 */
export interface ReactSketchCanvasProps
	extends Partial<
		Omit<
			CanvasProps,
			"paths" | "isDrawing" | "onPointerDown" | "onPointerMove" | "onPointerUp"
		>
	> {
	/**
	 * Width of eraser strokes in pixels.
	 *
	 * @remarks
	 * This width is used when `eraseMode(true)` is active or when a pen eraser
	 * button is detected.
	 *
	 * @defaultValue `8`
	 */
	eraserWidth?: number;
	/**
	 * Eraser behavior used when `eraseMode(true)` is active or a pen eraser
	 * button is detected.
	 *
	 * @remarks
	 * Use `"mask"` to preserve eraser gestures as SVG mask paths. Use `"stroke"`
	 * when erasing should delete whole drawing strokes touched by the eraser.
	 *
	 * @defaultValue `"mask"`
	 */
	eraserMode?: EraserMode;
	/**
	 * Called whenever the rendered path list changes.
	 *
	 * @remarks
	 * Use this callback to persist drawings as the user sketches. The callback is
	 * invoked after strokes, undo, redo, clear, reset, and `loadPaths` updates.
	 *
	 * @param updatedPaths - Complete current path list.
	 * @returns Nothing.
	 */
	onChange?: (updatedPaths: CanvasPath[]) => void;
	/**
	 * Called when the user completes a stroke.
	 *
	 * @remarks
	 * This callback fires for both drawing and erasing strokes. It is intended
	 * for event-style handling; use `onChange` when you need the complete drawing
	 * state.
	 *
	 * @param path - Stroke that was just completed.
	 * @param isEraser - Whether the completed stroke erased existing content.
	 * @returns Nothing.
	 */
	onStroke?: (path: CanvasPath, isEraser: boolean) => void;
	/**
	 * Color used for drawing strokes.
	 *
	 * @remarks
	 * Accepts any SVG stroke color value, including named colors, hex colors,
	 * RGB values, and CSS variables.
	 *
	 * @defaultValue "red"
	 */
	strokeColor?: string;
	/**
	 * Width of drawing strokes in pixels.
	 *
	 * @remarks
	 * Eraser strokes use `eraserWidth` instead.
	 *
	 * @defaultValue `4`
	 */
	strokeWidth?: number;
	/**
	 * Whether strokes should include start and end timestamps.
	 *
	 * @remarks
	 * Enable this before drawing if you want `CanvasPath.startTimestamp`,
	 * `CanvasPath.endTimestamp`, and `getSketchingTime()` to report active
	 * drawing time.
	 *
	 * @defaultValue false
	 */
	withTimestamp?: boolean;
}

/**
 * Imperative ref API exposed by {@link ReactSketchCanvas}.
 *
 * @remarks
 * Use this ref to control drawing mode, history, exports, and path loading
 * from parent components.
 *
 * @public
 */
export interface ReactSketchCanvasRef extends CanvasRef {
	/**
	 * Switch between drawing and erasing.
	 *
	 * @remarks
	 * Passing `true` enables erasing for future strokes. Passing `false` returns
	 * to normal drawing mode. Existing paths are not changed.
	 *
	 * @param erase - Whether future pointer strokes should erase.
	 * @returns Nothing.
	 */
	eraseMode: (erase: boolean) => void;
	/**
	 * Remove all paths from the canvas while preserving history.
	 *
	 * @remarks
	 * Users can still undo back to the previous drawing after `clearCanvas()`.
	 * Use `resetCanvas()` when you want to remove paths and clear undo/redo
	 * history.
	 *
	 * @returns Nothing.
	 */
	clearCanvas: () => void;
	/**
	 * Restore the previous history entry.
	 *
	 * @remarks
	 * Calling `undo()` when there is no earlier history entry leaves the canvas
	 * unchanged.
	 *
	 * @returns Nothing.
	 */
	undo: () => void;
	/**
	 * Restore the next history entry after an undo.
	 *
	 * @remarks
	 * Calling `redo()` when there is no later history entry leaves the canvas
	 * unchanged.
	 *
	 * @returns Nothing.
	 */
	redo: () => void;
	/**
	 * Export the current path data.
	 *
	 * @remarks
	 * The returned paths can be stored and later passed to `loadPaths()`.
	 *
	 * @returns Promise that resolves with the current path list.
	 */
	exportPaths: () => Promise<CanvasPath[]>;
	/**
	 * Append paths to the canvas.
	 *
	 * @remarks
	 * Existing paths are preserved. The provided paths are appended to the end
	 * of the current path list and become part of undo/redo history.
	 *
	 * @param paths - Paths to append to the current drawing.
	 * @returns Nothing.
	 */
	loadPaths: (paths: CanvasPath[]) => void;
	/**
	 * Get the total active drawing time in milliseconds.
	 *
	 * @remarks
	 * This only works when `withTimestamp` is enabled before drawing. Idle time
	 * between strokes is not included.
	 *
	 * @returns Promise that resolves with the total sketching time.
	 */
	getSketchingTime: () => Promise<number>;
	/**
	 * Remove all paths and clear undo/redo history.
	 *
	 * @remarks
	 * Use `clearCanvas()` instead when the user should be able to undo the
	 * clearing action.
	 *
	 * @returns Nothing.
	 */
	resetCanvas: () => void;
}
