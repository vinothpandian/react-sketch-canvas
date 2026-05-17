type PrepareSvgForExportParams = {
	id: string;
	canvasColor: string;
	exportWithBackgroundImage: boolean;
};

type PrepareSvgForExportReturns = SVGElement;

/**
 * Prepare a cloned SVG element for export.
 *
 * @remarks
 * When background image export is disabled, this removes the background image
 * pattern reference and fills the canvas background with `canvasColor`. The
 * input MUST be a cloned SVG because this function mutates the element.
 */
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
