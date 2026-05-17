import type { ExportImageOptions, ExportImageType } from "../../types";
import { prepareSvgForExport, removeBackgroundImageFromSvg } from "./svg";

type LoadImageReturns = Promise<HTMLImageElement>;

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

type ExportImageFromSvgReturns = Promise<string>;

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
	const preparedSvg = exportWithBackgroundImage
		? prepareSvgForExport(removeBackgroundImageFromSvg(svgCanvas, id), {
				id,
				canvasColor,
				exportWithBackgroundImage: true,
			})
		: prepareSvgForExport(svgCanvas, {
				id,
				canvasColor,
				exportWithBackgroundImage: false,
			});
	const serializedSvg = new XMLSerializer().serializeToString(preparedSvg);
	const canvasSketch = `data:image/svg+xml;base64,${btoa(
		unescape(encodeURIComponent(serializedSvg)),
	)}`;
	const strokeImage = await loadImage(canvasSketch);
	const renderCanvas = document.createElement("canvas");
	const pixelRatio =
		options?.width !== undefined || options?.height !== undefined
			? 1
			: Math.max(window.devicePixelRatio || 1, 1);
	renderCanvas.width = Math.round(exportWidth * pixelRatio);
	renderCanvas.height = Math.round(exportHeight * pixelRatio);
	renderCanvas.style.width = `${exportWidth}px`;
	renderCanvas.style.height = `${exportHeight}px`;
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

	if (exportWithBackgroundImage && backgroundImage) {
		try {
			const backgroundLayer = await loadImage(backgroundImage);
			context.drawImage(backgroundLayer, 0, 0, exportWidth, exportHeight);
		} catch {
			console.warn(
				"React Sketch Canvas could not load the background image while exporting. Check that backgroundImage points to a reachable image and allows cross-origin access.",
			);
		}
	}

	context.drawImage(strokeImage, 0, 0, exportWidth, exportHeight);

	return renderCanvas.toDataURL(`image/${imageType}`);
}
