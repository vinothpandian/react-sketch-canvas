/**
 * Raster image format used by {@link ReactSketchCanvasRef.exportImage} and
 * {@link CanvasRef.exportImage}.
 *
 * @remarks
 * Use `"png"` when you need transparency. Use `"jpeg"` for smaller files or
 * when the exported image should always include a solid background color.
 *
 * @public
 */
export type ExportImageType = "jpeg" | "png";

/**
 * Size options for raster image exports.
 *
 * @remarks
 * When omitted, the exported image uses the rendered canvas element's current
 * width and height. Provide both values to export a fixed-size image regardless
 * of the on-screen canvas size.
 *
 * @public
 */
export interface ExportImageOptions {
	/**
	 * Width of the exported image in pixels.
	 *
	 * @defaultValue The current rendered canvas width.
	 */
	readonly width?: number;
	/**
	 * Height of the exported image in pixels.
	 *
	 * @defaultValue The current rendered canvas height.
	 */
	readonly height?: number;
}

/**
 * A two-dimensional coordinate on the canvas.
 *
 * @remarks
 * Coordinates are measured in CSS pixels from the top-left corner of the
 * rendered canvas. Pointer events, exported paths, and loaded paths all use
 * this coordinate system.
 *
 * @public
 */
export interface Point {
	/**
	 * Horizontal coordinate in pixels from the left edge of the canvas.
	 */
	readonly x: number;
	/**
	 * Vertical coordinate in pixels from the top edge of the canvas.
	 */
	readonly y: number;
}

/**
 * A single stroke recorded by the sketch canvas.
 *
 * @remarks
 * `CanvasPath` is the persistence format returned by
 * {@link ReactSketchCanvasRef.exportPaths} and accepted by
 * {@link ReactSketchCanvasRef.loadPaths}. Store this object if you want to save
 * a drawing and replay it later.
 *
 * `drawMode` decides whether the stroke paints (`true`) or erases (`false`).
 * Eraser strokes are stored as paths so exports and undo/redo can preserve the
 * same visual result.
 *
 * @public
 */
export interface CanvasPath {
	/**
	 * Ordered points that make up this stroke.
	 *
	 * @remarks
	 * A stroke can contain a single point, which is rendered as a dot.
	 */
	readonly paths: Point[];
	/**
	 * Stroke width in pixels.
	 */
	readonly strokeWidth: number;
	/**
	 * Stroke color used when `drawMode` is `true`.
	 *
	 * @remarks
	 * Eraser paths are stored with an internal mask color, but consumers usually
	 * only need to preserve the value returned by `exportPaths`.
	 */
	readonly strokeColor: string;
	/**
	 * Whether the stroke draws color (`true`) or erases existing strokes
	 * (`false`).
	 */
	readonly drawMode: boolean;
	/**
	 * Timestamp captured when the stroke starts, in milliseconds since the Unix
	 * epoch.
	 *
	 * @remarks
	 * This is only present when `withTimestamp` is enabled.
	 */
	readonly startTimestamp?: number;
	/**
	 * Timestamp captured when the stroke ends, in milliseconds since the Unix
	 * epoch.
	 *
	 * @remarks
	 * This is only present when `withTimestamp` is enabled.
	 */
	readonly endTimestamp?: number;
}
