import type * as React from "react";
import type { ExportImageOptions, ExportImageType } from "../../types";
import {
	drawBackgroundLayer,
	loadBackgroundLayer,
	resolveBackgroundLayerPlan,
} from "./backgroundLayer";
import { encodeSvgDataUrl } from "./encoding";
import { loadImage } from "./imageLoader";
import { prepareSvgForExport, removeBackgroundImageFromSvg } from "./svg";

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

function createRasterCanvas(
	exportWidth: number,
	exportHeight: number,
): HTMLCanvasElement {
	const renderCanvas = document.createElement("canvas");

	renderCanvas.width = exportWidth;
	renderCanvas.height = exportHeight;
	renderCanvas.style.width = `${exportWidth}px`;
	renderCanvas.style.height = `${exportHeight}px`;

	return renderCanvas;
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
	const renderCanvas = createRasterCanvas(exportWidth, exportHeight);
	const context = renderCanvas.getContext("2d");

	if (!context) {
		throw Error("Canvas not rendered yet");
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
