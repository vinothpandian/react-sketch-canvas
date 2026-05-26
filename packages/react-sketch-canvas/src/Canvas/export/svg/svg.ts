/**
 * Arguments used to prepare a cloned SVG canvas for serialization.
 */
type PrepareSvgForExportArgs = {
	id: string;
	canvasColor: string;
	exportWithBackgroundImage: boolean;
};

/**
 * The cloned SVG element after export-specific mutations have been applied.
 */
type PrepareSvgForExportReturns = SVGElement;

let svgExportNonce = 0;

function queryInternalElement(
	svgCanvas: SVGElement,
	suffix: string,
): Element | null {
	return svgCanvas.querySelector(`[id$="__${suffix}"]`);
}

/**
 * Rewrite exported SVG ids so the serialized markup can coexist with the live canvas.
 *
 * @remarks
 * The drawing canvas relies on internal ids for masks, background patterns, and
 * `url(#...)` references. If an exported SVG is later rendered into the same
 * document, reusing those ids would cause the exported asset and the live
 * canvas to cross-reference each other. This helper assigns a unique export
 * prefix and updates every supported attribute that points at those ids.
 */
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

/**
 * Remove background-image-specific SVG nodes from a cloned canvas.
 *
 * @remarks
 * Raster export paints the background image as a separate layer to avoid
 * browser-specific SVG image artifacts. This helper strips the background
 * pattern and its visible rect from the cloned SVG so the serialized stroke
 * layer contains only vector content that should be composited above the
 * background.
 */
export function removeBackgroundImageFromSvg(
	svgCanvas: SVGElement,
): SVGElement {
	queryInternalElement(svgCanvas, "background")?.remove();
	queryInternalElement(svgCanvas, "canvas-background-group")?.remove();
	queryInternalElement(svgCanvas, "canvas-background")?.remove();

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
	{ id, canvasColor, exportWithBackgroundImage }: PrepareSvgForExportArgs,
): PrepareSvgForExportReturns {
	if (!exportWithBackgroundImage) {
		queryInternalElement(svgCanvas, "background")?.remove();
		queryInternalElement(svgCanvas, "canvas-background")?.setAttribute(
			"fill",
			canvasColor,
		);
	}

	namespaceSvgInternalIds(svgCanvas, id);

	return svgCanvas;
}
