import type * as React from "react";
import type { ExportImageOptions, ExportImageType } from "../../types";
import { prepareSvgForExport, removeBackgroundImageFromSvg } from "./svg";

/**
 * The resolved image element produced by browser image loading.
 */
type LoadImageReturns = Promise<HTMLImageElement>;

/**
 * Decide whether canvas export should request anonymous cross-origin image loading.
 *
 * @remarks
 * Data and blob URLs are already local to the document. Only cross-origin HTTP
 * images need `crossorigin="anonymous"` so the exported canvas can remain
 * readable when the remote server sends compatible CORS headers.
 */
function shouldUseAnonymousCrossOrigin(url: string): boolean {
	if (url.startsWith("data:") || url.startsWith("blob:")) {
		return false;
	}

	try {
		const parsedUrl = new URL(url, window.location.href);

		if (!/^https?:$/.test(parsedUrl.protocol)) {
			return false;
		}

		return parsedUrl.origin !== window.location.origin;
	} catch {
		return false;
	}
}

/**
 * Decide whether a configured background image must be painted outside the SVG.
 *
 * @remarks
 * Raster export composites the background as a normal canvas image layer for
 * every URL type. Keeping data/blob URLs inside the serialized SVG would make
 * browsers rasterize the SVG pattern themselves, which can tile the background
 * instead of stretching it to the export dimensions. External image URLs also
 * need this path because browsers do not reliably load external resources from
 * an SVG that is itself being rasterized as an image.
 */
function shouldPaintBackgroundAsRasterLayer(url: string): boolean {
	return url.length > 0;
}

/**
 * Load an image URL or data URL for canvas export.
 *
 * @remarks
 * The image is configured for anonymous cross-origin loading so browser canvas
 * security rules allow `toDataURL` when the remote server permits it.
 */
export const loadImage = (url: string): LoadImageReturns =>
	new Promise((resolve, reject) => {
		const img = new Image();

		if (shouldUseAnonymousCrossOrigin(url)) {
			img.crossOrigin = "anonymous";
		}

		img.addEventListener("load", () => {
			if (img.width > 0) {
				resolve(img);
				return;
			}
			reject(new Error("Image not found"));
		});
		img.addEventListener("error", (err) => reject(err));
		img.src = url;
	});

/**
 * Arguments required to render a cloned SVG canvas as a raster image.
 */
type ExportImageFromSvgParams = {
	id: string;
	svgCanvas: SVGElement;
	svgWidth: number;
	svgHeight: number;
	imageType: ExportImageType;
	canvasColor: string;
	backgroundImage: string;
	exportWithBackgroundImage: boolean;
	preserveBackgroundImageAspectRatio?: React.SVGAttributes<HTMLImageElement>["preserveAspectRatio"];
	options?: ExportImageOptions;
};

/**
 * The data URL produced by a raster image export.
 */
type ExportImageFromSvgReturns = Promise<string>;

type SvgAspectRatioAlign = "Min" | "Mid" | "Max";

type SvgAspectRatioMode = "meet" | "slice";

type ParsedSvgAspectRatio = {
	xAlign: SvgAspectRatioAlign;
	yAlign: SvgAspectRatioAlign;
	mode: SvgAspectRatioMode;
};

function parseSvgAspectRatio(
	preserveAspectRatio: React.SVGAttributes<HTMLImageElement>["preserveAspectRatio"],
): ParsedSvgAspectRatio | null {
	if (!preserveAspectRatio || preserveAspectRatio === "none") {
		return null;
	}

	const [align = "xMidYMid", mode = "meet"] = preserveAspectRatio.split(/\s+/);
	const alignMatch = /^x(Min|Mid|Max)Y(Min|Mid|Max)$/.exec(align);

	return {
		xAlign: (alignMatch?.[1] ?? "Mid") as SvgAspectRatioAlign,
		yAlign: (alignMatch?.[2] ?? "Mid") as SvgAspectRatioAlign,
		mode: mode === "slice" ? "slice" : "meet",
	};
}

function resolveAlignedOffset(
	containerSize: number,
	contentSize: number,
	align: SvgAspectRatioAlign,
): number {
	if (align === "Min") {
		return 0;
	}

	const remainingSize = containerSize - contentSize;

	if (align === "Max") {
		return remainingSize;
	}

	return remainingSize / 2;
}

function drawBackgroundLayer(
	context: CanvasRenderingContext2D,
	backgroundLayer: HTMLImageElement,
	exportWidth: number,
	exportHeight: number,
	preserveAspectRatio: React.SVGAttributes<HTMLImageElement>["preserveAspectRatio"],
): void {
	const parsedAspectRatio = parseSvgAspectRatio(preserveAspectRatio);
	const sourceWidth = backgroundLayer.naturalWidth || backgroundLayer.width;
	const sourceHeight = backgroundLayer.naturalHeight || backgroundLayer.height;

	if (!parsedAspectRatio || sourceWidth <= 0 || sourceHeight <= 0) {
		context.drawImage(backgroundLayer, 0, 0, exportWidth, exportHeight);
		return;
	}

	const widthScale = exportWidth / sourceWidth;
	const heightScale = exportHeight / sourceHeight;

	if (parsedAspectRatio.mode === "slice") {
		const scale = Math.max(widthScale, heightScale);
		const sourceCropWidth = exportWidth / scale;
		const sourceCropHeight = exportHeight / scale;
		const sourceX = resolveAlignedOffset(
			sourceWidth,
			sourceCropWidth,
			parsedAspectRatio.xAlign,
		);
		const sourceY = resolveAlignedOffset(
			sourceHeight,
			sourceCropHeight,
			parsedAspectRatio.yAlign,
		);

		context.drawImage(
			backgroundLayer,
			sourceX,
			sourceY,
			sourceCropWidth,
			sourceCropHeight,
			0,
			0,
			exportWidth,
			exportHeight,
		);
		return;
	}

	const scale = Math.min(widthScale, heightScale);
	const destinationWidth = sourceWidth * scale;
	const destinationHeight = sourceHeight * scale;
	const destinationX = resolveAlignedOffset(
		exportWidth,
		destinationWidth,
		parsedAspectRatio.xAlign,
	);
	const destinationY = resolveAlignedOffset(
		exportHeight,
		destinationHeight,
		parsedAspectRatio.yAlign,
	);

	context.drawImage(
		backgroundLayer,
		destinationX,
		destinationY,
		destinationWidth,
		destinationHeight,
	);
}

/**
 * Arguments used to prepare the stroke-only SVG layer for raster export.
 */
type PrepareStrokeSvgForRasterExportArgs = Pick<
	ExportImageFromSvgParams,
	| "id"
	| "svgCanvas"
	| "canvasColor"
	| "backgroundImage"
	| "exportWithBackgroundImage"
>;

/**
 * Prepare the SVG layer that will be rasterized above the background.
 *
 * @remarks
 * When background image export is enabled, the background image markup is
 * removed from the serialized SVG because the image is painted separately onto
 * the raster canvas. This avoids duplicate or browser-specific SVG image
 * artifacts while keeping strokes composited above the background.
 */
function prepareStrokeSvgForRasterExport(
	params: PrepareStrokeSvgForRasterExportArgs,
): SVGElement {
	const {
		id,
		svgCanvas,
		canvasColor,
		backgroundImage,
		exportWithBackgroundImage,
	} = params;

	if (
		exportWithBackgroundImage &&
		backgroundImage &&
		shouldPaintBackgroundAsRasterLayer(backgroundImage)
	) {
		const strokeOnlySvg = removeBackgroundImageFromSvg(svgCanvas, id);

		return prepareSvgForExport(strokeOnlySvg, {
			id,
			canvasColor,
			exportWithBackgroundImage: true,
		});
	}

	return prepareSvgForExport(svgCanvas, {
		id,
		canvasColor,
		exportWithBackgroundImage,
	});
}

/**
 * Encode an SVG element as an image data URL that can be loaded into `<canvas>`.
 */
function encodeSvgDataUrl(svgCanvas: SVGElement): string {
	const serializedSvg = new XMLSerializer().serializeToString(svgCanvas);
	const encodedSvg = btoa(unescape(encodeURIComponent(serializedSvg)));

	return `data:image/svg+xml;base64,${encodedSvg}`;
}

/**
 * Resolve the raster scale used for image export.
 *
 * @remarks
 * Explicit export dimensions are treated as final pixel dimensions. Without an
 * explicit size, the export uses the device pixel ratio so default-size exports
 * retain the visual sharpness of the on-screen canvas.
 */
function resolveRasterScale(options?: ExportImageOptions): number {
	const hasExplicitSize =
		options?.width !== undefined || options?.height !== undefined;

	if (hasExplicitSize) {
		return 1;
	}

	return Math.max(window.devicePixelRatio || 1, 1);
}

/**
 * Create the temporary canvas used to composite background and stroke layers.
 */
function createRasterCanvas(
	exportWidth: number,
	exportHeight: number,
	pixelRatio: number,
): HTMLCanvasElement {
	const renderCanvas = document.createElement("canvas");

	renderCanvas.width = Math.round(exportWidth * pixelRatio);
	renderCanvas.height = Math.round(exportHeight * pixelRatio);
	renderCanvas.style.width = `${exportWidth}px`;
	renderCanvas.style.height = `${exportHeight}px`;

	return renderCanvas;
}

/**
 * Load the optional background image layer for raster export.
 *
 * @remarks
 * Background image failures are recoverable: consumers still receive the
 * exported stroke layer, and the warning explains what image/CORS settings to
 * check.
 */
async function loadBackgroundLayer(
	backgroundImage: string,
	exportWithBackgroundImage: boolean,
): Promise<HTMLImageElement | null> {
	if (
		!exportWithBackgroundImage ||
		!backgroundImage ||
		!shouldPaintBackgroundAsRasterLayer(backgroundImage)
	) {
		return null;
	}

	try {
		return await loadImage(backgroundImage);
	} catch {
		console.warn(
			"React Sketch Canvas could not load the background image while exporting. Check that backgroundImage points to a reachable image and allows cross-origin access.",
		);
		return null;
	}
}

/**
 * Render a cloned SVG canvas into a raster image data URL.
 *
 * @remarks
 * The SVG is serialized, loaded into an HTML image, then painted onto a
 * temporary `<canvas>`. Background images are painted first so strokes remain
 * visible above them.
 */
export async function exportImageFromSvg({
	id,
	svgCanvas,
	svgWidth,
	svgHeight,
	imageType,
	canvasColor,
	backgroundImage,
	exportWithBackgroundImage,
	preserveBackgroundImageAspectRatio,
	options,
}: ExportImageFromSvgParams): ExportImageFromSvgReturns {
	const exportWidth = options?.width ?? svgWidth;
	const exportHeight = options?.height ?? svgHeight;
	const preparedSvg = prepareStrokeSvgForRasterExport({
		id,
		svgCanvas,
		canvasColor,
		backgroundImage,
		exportWithBackgroundImage,
	});
	const strokeImage = await loadImage(encodeSvgDataUrl(preparedSvg));
	const pixelRatio = resolveRasterScale(options);
	const renderCanvas = createRasterCanvas(
		exportWidth,
		exportHeight,
		pixelRatio,
	);
	const context = renderCanvas.getContext("2d");

	if (!context) {
		throw Error("Canvas not rendered yet");
	}

	if (pixelRatio !== 1) {
		context.scale(pixelRatio, pixelRatio);
	}

	const shouldFillCanvasBackground =
		!backgroundImage || !exportWithBackgroundImage;

	if (shouldFillCanvasBackground) {
		context.fillStyle = canvasColor;
		context.fillRect(0, 0, exportWidth, exportHeight);
	}

	const backgroundLayer = await loadBackgroundLayer(
		backgroundImage,
		exportWithBackgroundImage,
	);

	if (backgroundLayer) {
		drawBackgroundLayer(
			context,
			backgroundLayer,
			exportWidth,
			exportHeight,
			preserveBackgroundImageAspectRatio,
		);
	}

	context.drawImage(strokeImage, 0, 0, exportWidth, exportHeight);

	return renderCanvas.toDataURL(`image/${imageType}`);
}
