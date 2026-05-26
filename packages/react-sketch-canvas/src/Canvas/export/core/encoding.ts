/**
 * Encode an SVG element as an image data URL that can be loaded into `<canvas>`.
 */
export function encodeSvgDataUrl(svgCanvas: SVGElement): string {
	const serializedSvg = new XMLSerializer().serializeToString(svgCanvas);
	const utf8Bytes = new TextEncoder().encode(serializedSvg);
	let binary = "";
	for (const byte of utf8Bytes) {
		binary += String.fromCharCode(byte);
	}
	const encodedSvg = btoa(binary);

	return `data:image/svg+xml;base64,${encodedSvg}`;
}
