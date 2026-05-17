import type { ExportImageOptions, ExportImageType } from "../../types";

type LoadImageReturns = Promise<HTMLImageElement>;

export const loadImage = (url: string): LoadImageReturns =>
	new Promise((resolve, reject) => {
		const img = new Image();
		img.addEventListener("load", () => {
			if (img.width > 0) {
				resolve(img);
				return;
			}
			reject(new Error("Image not found"));
		});
		img.addEventListener("error", (err) => reject(err));
		img.src = url;
		img.setAttribute("crossorigin", "anonymous");
	});

type ExportImageFromSvgParams = {
	svgCanvas: SVGElement;
	svgWidth: number;
	svgHeight: number;
	imageType: ExportImageType;
	canvasColor: string;
	backgroundImage: string;
	exportWithBackgroundImage: boolean;
	options?: ExportImageOptions;
};

type ExportImageFromSvgReturns = Promise<string>;

export async function exportImageFromSvg({
	svgCanvas,
	svgWidth,
	svgHeight,
	imageType,
	canvasColor,
	backgroundImage,
	exportWithBackgroundImage,
	options,
}: ExportImageFromSvgParams): ExportImageFromSvgReturns {
	const exportWidth = options?.width ?? svgWidth;
	const exportHeight = options?.height ?? svgHeight;
	const canvasSketch = `data:image/svg+xml;base64,${btoa(svgCanvas.outerHTML)}`;
	const loadImagePromises = [loadImage(canvasSketch)];

	if (exportWithBackgroundImage && backgroundImage) {
		try {
			loadImagePromises.push(loadImage(backgroundImage));
		} catch {
			console.warn(
				"React Sketch Canvas could not load the background image while exporting. Check that backgroundImage points to a reachable image and allows cross-origin access.",
			);
		}
	}

	const images = await Promise.all(loadImagePromises);
	const renderCanvas = document.createElement("canvas");
	renderCanvas.setAttribute("width", exportWidth.toString());
	renderCanvas.setAttribute("height", exportHeight.toString());
	const context = renderCanvas.getContext("2d");

	if (!context) {
		throw Error("Canvas not rendered yet");
	}

	if (imageType === "jpeg" && !exportWithBackgroundImage) {
		context.fillStyle = canvasColor;
		context.fillRect(0, 0, exportWidth, exportHeight);
	}

	for (const image of images.reverse()) {
		context.drawImage(image, 0, 0, exportWidth, exportHeight);
	}

	return renderCanvas.toDataURL(`image/${imageType}`);
}
