/**
 * Return the user-facing error shown when background image loading fails.
 */
export function backgroundLoadErrorMessage(backgroundImage: string): string {
	if (backgroundImage.startsWith("data:")) {
		return "Cannot export: the background data URI could not be decoded as an image. Check that backgroundImage is a valid image data URL.";
	}

	if (isCrossOriginHttpUrl(backgroundImage)) {
		return "Cannot export: the cross-origin background image failed to load. Check the URL is reachable and that the server returns an Access-Control-Allow-Origin header so the image can be read into the export canvas.";
	}

	return "Cannot export: the background image failed to load. Check that backgroundImage points to a reachable image.";
}

function isCrossOriginHttpUrl(url: string): boolean {
	try {
		const parsedUrl = new URL(url, window.location.href);

		if (!/^https?:$/.test(parsedUrl.protocol)) {
			return false;
		}

		return parsedUrl.origin !== window.location.origin;
	} catch {
		return false;
	}
}
