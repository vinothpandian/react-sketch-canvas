import * as React from "react";
import type { ExportImageOptions, ExportImageType } from "../types";
import { useCanvasPointerHandlers } from "./hooks/useCanvasPointerHandlers";
import { CanvasSvg } from "./svg/CanvasSvg";
import type { CanvasProps, CanvasRef } from "./types";

const loadImage = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const img = new Image();
		img.addEventListener("load", () => {
			if (img.width > 0) {
				resolve(img);
			}
			reject(new Error("Image not found"));
		});
		img.addEventListener("error", (err) => reject(err));
		img.src = url;
		img.setAttribute("crossorigin", "anonymous");
	});

function getCanvasWithViewBox(canvas: HTMLDivElement) {
	const svgCanvas = canvas.firstChild?.cloneNode(true) as SVGElement;

	const width = canvas.offsetWidth;
	const height = canvas.offsetHeight;

	svgCanvas.setAttribute("viewBox", `0 0 ${width} ${height}`);

	svgCanvas.setAttribute("width", width.toString());
	svgCanvas.setAttribute("height", height.toString());
	return { svgCanvas, width, height };
}

/**
 * Canvas component
 *
 * This is a low-level component that is used to draw on the canvas.
 * This component is used by the ReactSketchCanvas component with some additional features.
 *
 * @param props - The props for the Canvas component
 * @param ref - The ref for the Canvas component
 * @returns The Canvas component
 */
export const Canvas = React.forwardRef<CanvasRef, CanvasProps>((props, ref) => {
	const {
		paths,
		isDrawing,
		onPointerDown,
		onPointerMove,
		onPointerUp,
		id = "react-sketch-canvas",
		width = "100%",
		height = "100%",
		className = "react-sketch-canvas",
		canvasColor = "white",
		backgroundImage = "",
		exportWithBackgroundImage = false,
		preserveBackgroundImageAspectRatio = "none",
		allowOnlyPointerType = "all",
		style = {
			border: "0.0625rem solid #9c9c9c",
			borderRadius: "0.25rem",
		},
		svgStyle = {},
		withViewBox = false,
		readOnly = false,
	} = props;

	const canvasRef = React.useRef<HTMLDivElement>(null);
	const canvasSizeRef = React.useRef<{ width: number; height: number } | null>(
		null,
	);

	const { handlePointerDown, handlePointerMove, handlePointerUp } =
		useCanvasPointerHandlers({
			canvasRef,
			canvasSizeRef,
			isDrawing,
			allowOnlyPointerType,
			onPointerDown,
			onPointerMove,
			onPointerUp,
		});

	React.useImperativeHandle(ref, () => ({
		exportImage: (
			imageType: ExportImageType,
			options?: ExportImageOptions,
		): Promise<string> =>
			new Promise<string>((resolve, reject) => {
				try {
					const canvas = canvasRef.current;

					if (!canvas) {
						throw Error("Canvas not rendered yet");
					}

					const {
						svgCanvas,
						width: svgWidth,
						height: svgHeight,
					} = getCanvasWithViewBox(canvas);
					const exportWidth = options?.width ?? svgWidth;
					const exportHeight = options?.height ?? svgHeight;

					const canvasSketch = `data:image/svg+xml;base64,${btoa(
						svgCanvas.outerHTML,
					)}`;

					const loadImagePromises = [loadImage(canvasSketch)];

					if (exportWithBackgroundImage && backgroundImage) {
						try {
							const img = loadImage(backgroundImage);
							loadImagePromises.push(img);
						} catch (error) {
							console.warn(
								"exportWithBackgroundImage props is set without a valid background image URL. This option is ignored",
							);
						}
					}

					Promise.all(loadImagePromises)
						.then((images) => {
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

							resolve(renderCanvas.toDataURL(`image/${imageType}`));
						})
						.catch((e) => {
							reject(e);
						});
				} catch (e) {
					reject(e);
				}
			}),
		exportSvg: (): Promise<string> =>
			new Promise<string>((resolve, reject) => {
				try {
					const canvas = canvasRef.current ?? null;

					if (canvas !== null) {
						const { svgCanvas } = getCanvasWithViewBox(canvas);

						if (exportWithBackgroundImage) {
							resolve(svgCanvas.outerHTML);
							return;
						}

						svgCanvas.querySelector(`#${id}__background`)?.remove();
						svgCanvas
							.querySelector(`#${id}__canvas-background`)
							?.setAttribute("fill", canvasColor);

						resolve(svgCanvas.outerHTML);
					}

					reject(new Error("Canvas not loaded"));
				} catch (e) {
					reject(e);
				}
			}),
	}));

	const viewBox =
		withViewBox && canvasSizeRef.current !== null
			? `0 0 ${canvasSizeRef.current.width} ${canvasSizeRef.current.height}`
			: undefined;

	return (
		<div
			role="presentation"
			ref={canvasRef}
			className={className}
			style={{
				touchAction: "none",
				width,
				height,
				...style,
			}}
			onPointerDown={readOnly ? undefined : handlePointerDown}
			onPointerMove={readOnly ? undefined : handlePointerMove}
			onPointerUp={readOnly ? undefined : handlePointerUp}
		>
			<CanvasSvg
				id={id}
				paths={paths}
				canvasColor={canvasColor}
				backgroundImage={backgroundImage}
				preserveBackgroundImageAspectRatio={preserveBackgroundImageAspectRatio}
				svgStyle={svgStyle}
				viewBox={viewBox}
			/>
		</div>
	);
});

Canvas.displayName = "@react-sketch-canvas/Canvas";
