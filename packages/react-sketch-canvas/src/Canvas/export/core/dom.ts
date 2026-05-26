type GetCanvasWithViewBoxReturns = {
	svgCanvas: SVGElement;
	width: number;
	height: number;
};

/**
 * Clone the rendered SVG and stamp it with the wrapper dimensions.
 *
 * @remarks
 * Export code works on a clone so callers can export without mutating the live
 * canvas. Width, height, and viewBox are normalized from the wrapper element to
 * make exported SVG and raster output match the rendered canvas size.
 */
export function getCanvasWithViewBox(
	canvas: HTMLDivElement,
): GetCanvasWithViewBoxReturns {
	const svgCanvas = canvas.firstChild?.cloneNode(true) as SVGElement;
	const width = canvas.offsetWidth;
	const height = canvas.offsetHeight;

	svgCanvas.setAttribute("viewBox", `0 0 ${width} ${height}`);
	svgCanvas.setAttribute("width", width.toString());
	svgCanvas.setAttribute("height", height.toString());

	return { svgCanvas, width, height };
}
