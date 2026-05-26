import type * as React from "react";
import type { ExportImageOptions, ExportImageType } from "../../../types";
import {
	drawBackgroundLayer,
	loadBackgroundLayer,
	resolveBackgroundLayerPlan,
} from "../background/layer";
import { encodeSvgDataUrl } from "../core/encoding";
import { loadImage } from "../core/imageLoader";
import { prepareSvgForExport, removeBackgroundImageFromSvg } from "../svg/svg";

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

type ExportImageFromSvgReturns = Promise<string>;

type PrepareStrokeSvgForRasterExportParams = Pick<
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
function prepareStrokeSvgForRasterExport({
	id,
	svgCanvas,
	canvasColor,
	backgroundImage,
	exportWithBackgroundImage,
}: PrepareStrokeSvgForRasterExportParams): SVGElement {
	if (exportWithBackgroundImage && backgroundImage) {
		const strokeOnlySvg = removeBackgroundImageFromSvg(svgCanvas);

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
 * Resolve the pixel-density multiplier to use for raster export.
 *
 * @remarks
 * When the caller does not request an explicit export size, the rasterizer
 * scales by `devicePixelRatio` so the output matches the sharpness of the
 * on-screen canvas on high-DPI displays. When `options.width` / `options.height`
 * are supplied, the caller is in charge of the output resolution and we keep a
 * 1:1 mapping so the produced image is exactly that many pixels.
 */
function resolveExportPixelRatio(
	options: ExportImageOptions | undefined,
): number {
	if (options?.width !== undefined || options?.height !== undefined) {
		return 1;
	}

	if (typeof window === "undefined") {
		return 1;
	}

	const ratio = window.devicePixelRatio;

	return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
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
	const backgroundLayerPlan = resolveBackgroundLayerPlan({
		backgroundImage,
		exportWithBackgroundImage,
		exportWidth,
		exportHeight,
		preserveAspectRatio: preserveBackgroundImageAspectRatio,
	});
	const preparedSvg = prepareStrokeSvgForRasterExport({
		id,
		svgCanvas,
		canvasColor,
		backgroundImage,
		exportWithBackgroundImage,
	});
	const strokeImage = await loadImage(encodeSvgDataUrl(preparedSvg));
	const pixelRatio = resolveExportPixelRatio(options);
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
		imageType === "jpeg" || !backgroundImage || !exportWithBackgroundImage;

	if (shouldFillCanvasBackground) {
		context.fillStyle = canvasColor;
		context.fillRect(0, 0, exportWidth, exportHeight);
	}

	const backgroundLayer = await loadBackgroundLayer(backgroundLayerPlan);

	if (backgroundLayer && backgroundLayerPlan.kind !== "none") {
		drawBackgroundLayer({
			context,
			backgroundLayer,
			plan: backgroundLayerPlan,
			exportWidth,
			exportHeight,
		});
	}

	context.drawImage(strokeImage, 0, 0, exportWidth, exportHeight);

	return renderCanvas.toDataURL(`image/${imageType}`);
}
