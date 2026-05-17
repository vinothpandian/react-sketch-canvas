import type * as React from "react";
import type {
	CanvasPath,
	ExportImageOptions,
	ExportImageType,
	Point,
} from "../types";

/**
 * Pointer device class accepted by the drawing surface.
 *
 * @remarks
 * Use `"all"` to accept mouse, pen, and touch input. Use a specific pointer
 * type when the canvas should ignore other input devices, for example a
 * pen-only signing flow.
 *
 * @public
 */
export type AllowOnlyPointerType = "all" | "pen" | "mouse" | "touch";

/**
 * Props for the low-level {@link Canvas} component.
 *
 * @remarks
 * These props are primarily useful for composing a custom state manager around
 * the low-level SVG canvas. Application code normally uses
 * {@link ReactSketchCanvasProps}.
 *
 * @public
 */
export interface CanvasProps {
	/**
	 * Paths rendered on the SVG canvas.
	 *
	 * @remarks
	 * `Canvas` is controlled. Pass the complete path list for each render.
	 */
	paths: CanvasPath[];
	/**
	 * Whether a pointer stroke is currently active.
	 *
	 * @remarks
	 * While this is `true`, pointer movement is forwarded to `onPointerMove`.
	 */
	isDrawing: boolean;
	/**
	 * Called when the user starts a stroke.
	 *
	 * @remarks
	 * The callback receives the pointer coordinate normalized to the canvas and
	 * an eraser flag when a pen eraser button is detected.
	 *
	 * @param point - Canvas-relative point where the stroke starts.
	 * @param isEraser - Whether the pointer should create an eraser stroke.
	 * @returns Nothing.
	 */
	onPointerDown: (point: Point, isEraser?: boolean) => void;
	/**
	 * Called when the active pointer moves while drawing.
	 *
	 * @param point - Canvas-relative point for the current pointer position.
	 * @returns Nothing.
	 */
	onPointerMove: (point: Point) => void;
	/**
	 * Called when the active stroke ends.
	 *
	 * @remarks
	 * `Canvas` listens for `pointerup` on the document so a stroke can finish
	 * even when the pointer is released outside the canvas element.
	 *
	 * @returns Nothing.
	 */
	onPointerUp: () => void;
	/**
	 * Pointer device class allowed to draw on the canvas.
	 *
	 * @remarks
	 * Other pointer devices can still interact with the page, but their drawing
	 * events are ignored by the canvas.
	 *
	 * @defaultValue `"all"`
	 */
	allowOnlyPointerType: AllowOnlyPointerType;
	/**
	 * Background image shown behind all strokes.
	 *
	 * @remarks
	 * Accepts any SVG `<image>` `href` value, including a URL or data URI. When
	 * exporting with the background image enabled, remote images must allow
	 * cross-origin access.
	 *
	 * @defaultValue `""`
	 */
	backgroundImage: string;
	/**
	 * Background color shown when no background image is configured.
	 *
	 * @remarks
	 * This color is also used behind JPEG exports when the background image is
	 * not included.
	 *
	 * @defaultValue `"white"`
	 */
	canvasColor: string;
	/**
	 * CSS class name applied to the outer canvas wrapper.
	 *
	 * @defaultValue `"react-sketch-canvas"`
	 */
	className?: string;
	/**
	 * Whether exported images and SVGs include `backgroundImage`.
	 *
	 * @remarks
	 * Set this to `false` when the background image is only a drawing guide and
	 * should not be part of exported output.
	 *
	 * @defaultValue false
	 */
	exportWithBackgroundImage: boolean;
	/**
	 * CSS height of the canvas wrapper.
	 *
	 * @remarks
	 * Accepts any valid CSS height value, such as `"400px"`, `"60vh"`, or
	 * `"100%"`.
	 *
	 * @defaultValue `"100%"`
	 */
	height: string;
	/**
	 * Base DOM id used for the SVG canvas and generated SVG definitions.
	 *
	 * @remarks
	 * Use a unique id when rendering more than one canvas on the same page.
	 *
	 * @defaultValue `"react-sketch-canvas"`
	 */
	id?: string;
	/**
	 * SVG `preserveAspectRatio` value used for `backgroundImage`.
	 *
	 * @remarks
	 * See the MDN reference for accepted values:
	 * {@link https://developer.mozilla.org/docs/Web/SVG/Attribute/preserveAspectRatio}.
	 *
	 * @defaultValue `"none"`
	 */
	preserveBackgroundImageAspectRatio?: React.SVGAttributes<HTMLImageElement>["preserveAspectRatio"];
	/**
	 * Inline styles applied to the outer canvas wrapper.
	 *
	 * @remarks
	 * The component always sets `touchAction: "none"` to keep touch and pen
	 * drawing from scrolling the page.
	 *
	 * @defaultValue The package default canvas border style.
	 */
	style: React.CSSProperties;
	/**
	 * Inline styles applied to the internal SVG element.
	 *
	 * @defaultValue `{}`
	 */
	svgStyle: React.CSSProperties;
	/**
	 * Whether the internal SVG should include a viewBox based on the latest
	 * measured canvas size.
	 *
	 * @remarks
	 * Enable this when you need SVG output that scales predictably with the
	 * rendered canvas dimensions.
	 *
	 * @defaultValue false
	 */
	withViewBox?: boolean;
	/**
	 * CSS width of the canvas wrapper.
	 *
	 * @remarks
	 * Accepts any valid CSS width value, such as `"600px"`, `"100%"`, or
	 * `"80vw"`.
	 *
	 * @defaultValue `"100%"`
	 */
	width: string;
	/**
	 * Whether pointer drawing is disabled.
	 *
	 * @remarks
	 * Existing paths are still rendered and ref export methods still work.
	 *
	 * @defaultValue false
	 */
	readOnly?: boolean;
}

/**
 * Imperative ref API exposed by the low-level {@link Canvas} component.
 *
 * @public
 */
export interface CanvasRef {
	/**
	 * Export the current canvas as a raster image data URL.
	 *
	 * @remarks
	 * The output includes the currently rendered strokes. Background image export
	 * depends on the `exportWithBackgroundImage` prop.
	 *
	 * @param imageType - Image format to create.
	 * @param options - Optional export dimensions.
	 * @returns Promise that resolves to a `data:image/*` URL.
	 */
	exportImage: (
		imageType: ExportImageType,
		options?: ExportImageOptions,
	) => Promise<string>;
	/**
	 * Export the current canvas as SVG markup.
	 *
	 * @remarks
	 * The returned string contains the cloned SVG element after export-specific
	 * background handling has been applied.
	 *
	 * @returns Promise that resolves to SVG markup.
	 */
	exportSvg: () => Promise<string>;
}
