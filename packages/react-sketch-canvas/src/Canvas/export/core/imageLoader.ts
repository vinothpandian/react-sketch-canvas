/**
 * The resolved image element produced by browser image loading.
 */
type LoadImageReturns = Promise<HTMLImageElement>;

/**
 * Decide whether canvas export should request anonymous cross-origin image loading.
 *
 * @remarks
 * Data and blob URLs are already local to the document. Only cross-origin HTTP
 * images need `crossorigin="anonymous"` so the exported canvas can remain
 * readable when the remote server sends compatible CORS headers.
 */
function shouldUseAnonymousCrossOrigin(url: string): boolean {
	if (url.startsWith("data:") || url.startsWith("blob:")) {
		return false;
	}

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

/**
 * Load an image URL or data URL for canvas export.
 *
 * @remarks
 * The image is configured for anonymous cross-origin loading only when that is
 * required for a remote HTTP image.
 */
export const loadImage = (url: string): LoadImageReturns =>
	new Promise((resolve, reject) => {
		const img = new Image();

		if (shouldUseAnonymousCrossOrigin(url)) {
			img.crossOrigin = "anonymous";
		}

		img.addEventListener("load", () => {
			if (img.width > 0) {
				resolve(img);
				return;
			}
			reject(new Error("Image not found"));
		});
		img.addEventListener("error", (err) => reject(err));
		img.src = url;
	});
