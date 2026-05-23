import type * as React from "react";
import { encodeSvgDataUrl } from "./encoding";
import { loadImage } from "./imageLoader";

type PreserveAspectRatio =
	React.SVGAttributes<HTMLImageElement>["preserveAspectRatio"];

type BackgroundLayerPlan =
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

type ResolveBackgroundLayerPlanParams = {
	backgroundImage: string;
	exportWithBackgroundImage: boolean;
	exportWidth: number;
	exportHeight: number;
	preserveAspectRatio: PreserveAspectRatio;
};

type DrawDirectImageLayerParams = {
	context: CanvasRenderingContext2D;
	backgroundLayer: HTMLImageElement;
	exportWidth: number;
	exportHeight: number;
	preserveAspectRatio: PreserveAspectRatio;
};

type LoadBackgroundLayerReturns = Promise<HTMLImageElement | null>;

type DrawBackgroundLayerParams = {
	context: CanvasRenderingContext2D;
	backgroundLayer: HTMLImageElement;
	plan: Exclude<BackgroundLayerPlan, { kind: "none" }>;
	exportWidth: number;
	exportHeight: number;
};

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

function isSvgDataUri(url: string): boolean {
	return /^data:image\/svg\+xml(?:[;,]|$)/i.test(url);
}

function decodeSvgDataUri(url: string): string | null {
	const match = /^data:image\/svg\+xml(?<metadata>[^,]*),(?<data>.*)$/i.exec(
		url,
	);

	if (!match?.groups) {
		return null;
	}

	const { metadata, data } = match.groups;

	try {
		if (metadata.includes(";base64")) {
			return decodeURIComponent(escape(atob(data)));
		}

		return decodeURIComponent(data);
	} catch {
		return null;
	}
}

function normalizeSvgDataUriDimensions(url: string): string {
	const svgText = decodeSvgDataUri(url);

	if (!svgText) {
		return url;
	}

	const document = new DOMParser().parseFromString(svgText, "image/svg+xml");
	const svgElement = document.documentElement;

	if (svgElement.nodeName.toLowerCase() !== "svg") {
		return url;
	}

	if (svgElement.hasAttribute("width") && svgElement.hasAttribute("height")) {
		return url;
	}

	const viewBox = svgElement.getAttribute("viewBox");

	if (!viewBox) {
		return url;
	}

	const [, , width, height] = viewBox
		.trim()
		.split(/[\s,]+/)
		.map(Number);

	if (!Number.isFinite(width) || !Number.isFinite(height)) {
		return url;
	}

	if (!svgElement.hasAttribute("width")) {
		svgElement.setAttribute("width", String(width));
	}

	if (!svgElement.hasAttribute("height")) {
		svgElement.setAttribute("height", String(height));
	}

	const serializedSvg = new XMLSerializer().serializeToString(svgElement);

	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializedSvg)}`;
}

function createSvgBackgroundLayer({
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

type SvgAspectRatioAlign = "Min" | "Mid" | "Max";

type SvgAspectRatioMode = "meet" | "slice";

type ParsedSvgAspectRatio = {
	xAlign: SvgAspectRatioAlign;
	yAlign: SvgAspectRatioAlign;
	mode: SvgAspectRatioMode;
};

function parseSvgAspectRatio(
	preserveAspectRatio: PreserveAspectRatio,
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

function drawDirectImageLayer({
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

export async function loadBackgroundLayer(
	plan: BackgroundLayerPlan,
): LoadBackgroundLayerReturns {
	try {
		if (plan.kind === "none") {
			return null;
		}

		if (plan.kind === "svg-wrapper") {
			const backgroundSvg = createSvgBackgroundLayer(plan);

			return await loadImage(encodeSvgDataUrl(backgroundSvg));
		}

		return await loadImage(normalizeSvgDataUriDimensions(plan.backgroundImage));
	} catch {
		console.warn(
			"React Sketch Canvas could not load the background image while exporting. Check that backgroundImage points to a reachable image and allows cross-origin access.",
		);
		return null;
	}
}

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
