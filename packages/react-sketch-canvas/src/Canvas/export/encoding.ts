/**
 * Encode an SVG element as an image data URL that can be loaded into `<canvas>`.
 */
export function encodeSvgDataUrl(svgCanvas: SVGElement): string {
	const serializedSvg = new XMLSerializer().serializeToString(svgCanvas);
	const encodedSvg = btoa(unescape(encodeURIComponent(serializedSvg)));

	return `data:image/svg+xml;base64,${encodedSvg}`;
}
