import { parseSvgAspectRatio, resolveAlignedOffset } from "./aspectRatio";
import type { PreserveAspectRatio } from "./backgroundPlan";

/**
 * Inputs required to paint a non-wrapped background image.
 */
export type DrawDirectImageLayerParams = {
	context: CanvasRenderingContext2D;
	backgroundLayer: HTMLImageElement;
	exportWidth: number;
	exportHeight: number;
	preserveAspectRatio: PreserveAspectRatio;
};

/**
 * Draw a raster or normalized SVG background image with SVG aspect-ratio rules.
 */
export function drawDirectImageLayer({
	context,
	backgroundLayer,
	exportWidth,
	exportHeight,
	preserveAspectRatio,
}: DrawDirectImageLayerParams): void {
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
