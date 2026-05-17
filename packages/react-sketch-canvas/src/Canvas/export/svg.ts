type PrepareSvgForExportParams = {
	id: string;
	canvasColor: string;
	exportWithBackgroundImage: boolean;
};

type PrepareSvgForExportReturns = SVGElement;

let svgExportNonce = 0;

function namespaceSvgInternalIds(svgCanvas: SVGElement, id: string): void {
	svgExportNonce += 1;
	const exportPrefix = `${id}__export-${svgExportNonce}`;
	const idMap = new Map<string, string>();

	for (const element of svgCanvas.querySelectorAll("[id]")) {
		const currentId = element.getAttribute("id");

		if (!currentId?.startsWith(`${id}__`)) {
			continue;
		}

		const nextId = currentId.replace(`${id}__`, `${exportPrefix}__`);
		idMap.set(currentId, nextId);
		element.setAttribute("id", nextId);
	}

	const rewriteAttributeValue = (value: string): string => {
		let nextValue = value;

		for (const [currentId, nextId] of idMap) {
			nextValue = nextValue.replaceAll(`url(#${currentId})`, `url(#${nextId})`);

			if (nextValue === `#${currentId}`) {
				nextValue = `#${nextId}`;
			}
		}

		return nextValue;
	};

	for (const element of svgCanvas.querySelectorAll("*")) {
		for (const attributeName of ["fill", "mask", "href", "xlink:href"]) {
			const value = element.getAttribute(attributeName);

			if (!value) {
				continue;
			}

			const nextValue = rewriteAttributeValue(value);

			if (nextValue !== value) {
				element.setAttribute(attributeName, nextValue);
			}
		}
	}
}

export function removeBackgroundImageFromSvg(
	svgCanvas: SVGElement,
	id: string,
): SVGElement {
	svgCanvas.querySelector(`#${id}__background`)?.remove();
	svgCanvas.querySelector(`#${id}__canvas-background-group`)?.remove();
	svgCanvas.querySelector(`#${id}__canvas-background`)?.remove();

	return svgCanvas;
}

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
	if (!exportWithBackgroundImage) {
		svgCanvas.querySelector(`#${id}__background`)?.remove();
		svgCanvas
			.querySelector(`#${id}__canvas-background`)
			?.setAttribute("fill", canvasColor);
	}

	namespaceSvgInternalIds(svgCanvas, id);

	return svgCanvas;
}
