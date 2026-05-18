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
			img.setAttribute("crossorigin", "anonymous");
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
	options?: ExportImageOptions;
};

/**
 * The data URL produced by a raster image export.
 */
type ExportImageFromSvgReturns = Promise<string>;

/**
 * Arguments used to prepare the stroke-only SVG layer for raster export.
 */
type PrepareStrokeSvgForRasterExportArgs = Pick<
	ExportImageFromSvgParams,
	"id" | "svgCanvas" | "canvasColor" | "exportWithBackgroundImage"
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
	const { id, svgCanvas, canvasColor, exportWithBackgroundImage } = params;

	if (exportWithBackgroundImage) {
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
		exportWithBackgroundImage: false,
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
	if (!exportWithBackgroundImage || !backgroundImage) {
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
	options,
}: ExportImageFromSvgParams): ExportImageFromSvgReturns {
	const exportWidth = options?.width ?? svgWidth;
	const exportHeight = options?.height ?? svgHeight;
	const preparedSvg = prepareStrokeSvgForRasterExport({
		id,
		svgCanvas,
		canvasColor,
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
		context.drawImage(backgroundLayer, 0, 0, exportWidth, exportHeight);
	}

	context.drawImage(strokeImage, 0, 0, exportWidth, exportHeight);

	return renderCanvas.toDataURL(`image/${imageType}`);
}
