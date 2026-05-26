import type * as React from "react";

/**
 * SVG image aspect-ratio policy used when drawing a background image.
 */
export type PreserveAspectRatio =
	React.SVGAttributes<HTMLImageElement>["preserveAspectRatio"];

/**
 * Description of how a background image should be prepared for raster export.
 */
export type BackgroundLayerPlan =
	| { kind: "none" }
	| {
			kind: "direct-image";
			backgroundImage: string;
			preserveAspectRatio: PreserveAspectRatio;
	  }
	| {
			kind: "svg-wrapper";
			backgroundImage: string;
			exportWidth: number;
			exportHeight: number;
			preserveAspectRatio: PreserveAspectRatio;
	  };

/**
 * Inputs used to decide whether raster export needs a background layer.
 */
export type ResolveBackgroundLayerPlanParams = {
	backgroundImage: string;
	exportWithBackgroundImage: boolean;
	exportWidth: number;
	exportHeight: number;
	preserveAspectRatio: PreserveAspectRatio;
};

/**
 * Return the background loading strategy for a raster export.
 */
export function resolveBackgroundLayerPlan({
	backgroundImage,
	exportWithBackgroundImage,
	exportWidth,
	exportHeight,
	preserveAspectRatio,
}: ResolveBackgroundLayerPlanParams): BackgroundLayerPlan {
	if (!exportWithBackgroundImage || !backgroundImage) {
		return { kind: "none" };
	}

	if (isSvgDataUri(backgroundImage)) {
		return {
			kind: "svg-wrapper",
			backgroundImage,
			exportWidth,
			exportHeight,
			preserveAspectRatio,
		};
	}

	return {
		kind: "direct-image",
		backgroundImage,
		preserveAspectRatio,
	};
}

/**
 * Check whether a URL is an SVG data URI that needs export-time normalization.
 */
export function isSvgDataUri(url: string): boolean {
	return /^data:image\/svg\+xml(?:[;,]|$)/i.test(url);
}
