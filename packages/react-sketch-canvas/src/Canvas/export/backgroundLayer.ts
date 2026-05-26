import { backgroundLoadErrorMessage } from "./backgroundErrors";
import {
	type BackgroundLayerPlan,
	resolveBackgroundLayerPlan,
} from "./backgroundPlan";
import { drawDirectImageLayer } from "./directImageLayer";
import { encodeSvgDataUrl } from "./encoding";
import { loadImage } from "./imageLoader";
import { createSvgBackgroundLayer } from "./svgBackgroundLayer";
import { normalizeSvgDataUriDimensions } from "./svgDataUri";

export type { BackgroundLayerPlan };
export { resolveBackgroundLayerPlan };

type LoadBackgroundLayerReturns = Promise<HTMLImageElement | null>;

type DrawBackgroundLayerParams = {
	context: CanvasRenderingContext2D;
	backgroundLayer: HTMLImageElement;
	plan: Exclude<BackgroundLayerPlan, { kind: "none" }>;
	exportWidth: number;
	exportHeight: number;
};

/**
 * Load the planned background layer image for raster export.
 */
export async function loadBackgroundLayer(
	plan: BackgroundLayerPlan,
): LoadBackgroundLayerReturns {
	if (plan.kind === "none") {
		return null;
	}

	try {
		if (plan.kind === "svg-wrapper") {
			const backgroundSvg = createSvgBackgroundLayer(plan);

			return await loadImage(encodeSvgDataUrl(backgroundSvg));
		}

		return await loadImage(normalizeSvgDataUriDimensions(plan.backgroundImage));
	} catch (cause) {
		throw new Error(backgroundLoadErrorMessage(plan.backgroundImage), {
			cause,
		});
	}
}

/**
 * Paint the loaded background layer into the export canvas.
 */
export function drawBackgroundLayer({
	context,
	backgroundLayer,
	plan,
	exportWidth,
	exportHeight,
}: DrawBackgroundLayerParams): void {
	if (plan.kind === "svg-wrapper") {
		context.drawImage(backgroundLayer, 0, 0, exportWidth, exportHeight);
		return;
	}

	drawDirectImageLayer({
		context,
		backgroundLayer,
		exportWidth,
		exportHeight,
		preserveAspectRatio: plan.preserveAspectRatio,
	});
}
