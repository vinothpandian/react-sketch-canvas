type PrepareSvgForExportOptions = {
	id: string;
	canvasColor: string;
	exportWithBackgroundImage: boolean;
};

export function prepareSvgForExport(
	svgCanvas: SVGElement,
	{ id, canvasColor, exportWithBackgroundImage }: PrepareSvgForExportOptions,
): SVGElement {
	if (exportWithBackgroundImage) {
		return svgCanvas;
	}

	svgCanvas.querySelector(`#${id}__background`)?.remove();
	svgCanvas
		.querySelector(`#${id}__canvas-background`)
		?.setAttribute("fill", canvasColor);

	return svgCanvas;
}
