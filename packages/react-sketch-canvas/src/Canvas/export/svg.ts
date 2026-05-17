type PrepareSvgForExportParams = {
	id: string;
	canvasColor: string;
	exportWithBackgroundImage: boolean;
};

type PrepareSvgForExportReturns = SVGElement;

export function prepareSvgForExport(
	svgCanvas: SVGElement,
	{ id, canvasColor, exportWithBackgroundImage }: PrepareSvgForExportParams,
): PrepareSvgForExportReturns {
	if (exportWithBackgroundImage) {
		return svgCanvas;
	}

	svgCanvas.querySelector(`#${id}__background`)?.remove();
	svgCanvas
		.querySelector(`#${id}__canvas-background`)
		?.setAttribute("fill", canvasColor);

	return svgCanvas;
}
