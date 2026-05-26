/**
 * Decode base64 SVG data URI payloads as UTF-8 text.
 */
export function decodeBase64Utf8(data: string): string {
	const binary = atob(data);
	const bytes = new Uint8Array(binary.length);

	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i);
	}

	return new TextDecoder("utf-8").decode(bytes);
}

/**
 * Decode an SVG data URI into SVG markup.
 */
export function decodeSvgDataUri(url: string): string | null {
	const match = /^data:image\/svg\+xml([^,]*),(.*)$/i.exec(url);

	if (!match) {
		return null;
	}

	const [, metadata = "", data = ""] = match;

	try {
		if (metadata.includes(";base64")) {
			return decodeBase64Utf8(data);
		}

		return decodeURIComponent(data);
	} catch {
		return null;
	}
}

/**
 * Add missing intrinsic dimensions to SVG data URIs that only define a viewBox.
 */
export function normalizeSvgDataUriDimensions(url: string): string {
	const svgText = decodeSvgDataUri(url);

	if (!svgText) {
		return url;
	}

	const document = new DOMParser().parseFromString(svgText, "image/svg+xml");
	const svgElement = document.documentElement;

	if (svgElement.nodeName.toLowerCase() !== "svg") {
		return url;
	}

	if (svgElement.hasAttribute("width") && svgElement.hasAttribute("height")) {
		return url;
	}

	const viewBox = svgElement.getAttribute("viewBox");

	if (!viewBox) {
		return url;
	}

	const [, , width, height] = viewBox
		.trim()
		.split(/[\s,]+/)
		.map(Number);

	if (!Number.isFinite(width) || !Number.isFinite(height)) {
		return url;
	}

	if (!svgElement.hasAttribute("width")) {
		svgElement.setAttribute("width", String(width));
	}

	if (!svgElement.hasAttribute("height")) {
		svgElement.setAttribute("height", String(height));
	}

	const serializedSvg = new XMLSerializer().serializeToString(svgElement);

	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializedSvg)}`;
}
