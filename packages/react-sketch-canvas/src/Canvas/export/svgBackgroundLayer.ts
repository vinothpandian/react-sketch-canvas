import type { BackgroundLayerPlan } from "./backgroundPlan";

/**
 * Create an SVG wrapper that lets SVG background data URIs render consistently.
 */
export function createSvgBackgroundLayer({
	backgroundImage,
	exportWidth,
	exportHeight,
	preserveAspectRatio,
}: Extract<BackgroundLayerPlan, { kind: "svg-wrapper" }>): SVGElement {
	const svgNamespace = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(svgNamespace, "svg");
	const defs = document.createElementNS(svgNamespace, "defs");
	const pattern = document.createElementNS(svgNamespace, "pattern");
	const image = document.createElementNS(svgNamespace, "image");
	const rect = document.createElementNS(svgNamespace, "rect");

	svg.setAttribute("xmlns", svgNamespace);
	svg.setAttribute("width", String(exportWidth));
	svg.setAttribute("height", String(exportHeight));
	svg.setAttribute("viewBox", `0 0 ${exportWidth} ${exportHeight}`);

	pattern.setAttribute("id", "react-sketch-canvas-export-background");
	pattern.setAttribute("x", "0");
	pattern.setAttribute("y", "0");
	pattern.setAttribute("width", "100%");
	pattern.setAttribute("height", "100%");
	pattern.setAttribute("patternUnits", "userSpaceOnUse");

	image.setAttribute("x", "0");
	image.setAttribute("y", "0");
	image.setAttribute("width", "100%");
	image.setAttribute("height", "100%");
	image.setAttribute("href", backgroundImage);

	if (preserveAspectRatio) {
		image.setAttribute("preserveAspectRatio", preserveAspectRatio);
	}

	rect.setAttribute("x", "0");
	rect.setAttribute("y", "0");
	rect.setAttribute("width", "100%");
	rect.setAttribute("height", "100%");
	rect.setAttribute("fill", "url(#react-sketch-canvas-export-background)");

	pattern.append(image);
	defs.append(pattern);
	svg.append(defs, rect);

	return svg;
}
