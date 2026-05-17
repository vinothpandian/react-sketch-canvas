export function getCanvasWithViewBox(canvas: HTMLDivElement) {
	const svgCanvas = canvas.firstChild?.cloneNode(true) as SVGElement;
	const width = canvas.offsetWidth;
	const height = canvas.offsetHeight;

	svgCanvas.setAttribute("viewBox", `0 0 ${width} ${height}`);
	svgCanvas.setAttribute("width", width.toString());
	svgCanvas.setAttribute("height", height.toString());

	return { svgCanvas, width, height };
}
