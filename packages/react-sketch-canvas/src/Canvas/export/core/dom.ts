type GetCanvasWithViewBoxReturns = {
	svgCanvas: SVGElement;
	width: number;
	height: number;
};

type ViewBox = {
	minX: number;
	minY: number;
	width: number;
	height: number;
};

function parseViewBox(value: string | null): ViewBox | null {
	if (!value) return null;

	const parts = value
		.trim()
		.split(/[\s,]+/)
		.map(Number);

	if (parts.length !== 4 || !parts.every(Number.isFinite)) return null;

	const [minX, minY, width, height] = parts;

	return { minX, minY, width, height };
}

/**
 * Clone the rendered SVG and stamp it with the wrapper dimensions.
 *
 * @remarks
 * Export code works on a clone so callers can export without mutating the live
 * canvas. Width, height, and viewBox are normalized from the wrapper element to
 * make exported SVG and raster output match the rendered canvas size. When the
 * live SVG has a viewBox that extends past the wrapper (e.g. `withViewBox`
 * fitting off-canvas paths), the exported viewBox keeps those bounds so the
 * export matches what is rendered.
 */
export function getCanvasWithViewBox(
	canvas: HTMLDivElement,
): GetCanvasWithViewBoxReturns {
	const svgCanvas = canvas.firstChild?.cloneNode(true) as SVGElement;
	const width = canvas.offsetWidth;
	const height = canvas.offsetHeight;

	const liveViewBox = parseViewBox(svgCanvas.getAttribute("viewBox"));
	const minX = Math.min(0, liveViewBox?.minX ?? 0);
	const minY = Math.min(0, liveViewBox?.minY ?? 0);
	const maxX = Math.max(
		width,
		liveViewBox ? liveViewBox.minX + liveViewBox.width : 0,
	);
	const maxY = Math.max(
		height,
		liveViewBox ? liveViewBox.minY + liveViewBox.height : 0,
	);

	svgCanvas.setAttribute(
		"viewBox",
		`${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
	);
	svgCanvas.setAttribute("width", width.toString());
	svgCanvas.setAttribute("height", height.toString());

	return { svgCanvas, width, height };
}
