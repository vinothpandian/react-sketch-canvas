import * as React from "react";
import { useCanvasExportHandle } from "./hooks/useCanvasExportHandle";
import { useCanvasPointerHandlers } from "./hooks/useCanvasPointerHandlers";
import { CanvasSvg } from "./svg/CanvasSvg";
import type { CanvasProps, CanvasRef } from "./types";

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

	useCanvasExportHandle(ref, {
		canvasRef,
		id,
		canvasColor,
		backgroundImage,
		exportWithBackgroundImage,
	});

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
