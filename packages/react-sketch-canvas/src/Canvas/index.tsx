import * as React from "react";
import { useCanvasExportHandle } from "./hooks/useCanvasExportHandle";
import { useCanvasPointerHandlers } from "./hooks/useCanvasPointerHandlers";
import { CanvasSvg } from "./svg/CanvasSvg";
import type { CanvasProps, CanvasRef } from "./types";

/**
 * Type of the low-level SVG canvas component.
 *
 * @remarks
 * Keeping this explicit preserves the public prop and ref contract in generated
 * declaration files.
 */
type CanvasComponent = React.ForwardRefExoticComponent<
	CanvasProps & React.RefAttributes<CanvasRef>
>;

/**
 * Low-level SVG drawing canvas.
 *
 * @remarks
 * `Canvas` renders the SVG surface, handles pointer normalization, and exposes
 * export methods through its forwarded ref. Most consumers should use
 * `ReactSketchCanvas` instead, which manages drawing state and undo/redo.
 *
 * Use `Canvas` directly when you need full control over path state, custom
 * history behavior, or integration with an external drawing state machine.
 *
 * @param props - Rendering, pointer, and export options for the canvas.
 * @param ref - Ref exposing {@link CanvasRef} export methods.
 * @returns The low-level canvas element.
 *
 * @public
 */
export const Canvas: CanvasComponent = React.forwardRef<CanvasRef, CanvasProps>(
	(props, ref) => {
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
		const canvasSizeRef = React.useRef<{
			width: number;
			height: number;
		} | null>(null);

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
					preserveBackgroundImageAspectRatio={
						preserveBackgroundImageAspectRatio
					}
					svgStyle={svgStyle}
					viewBox={viewBox}
				/>
			</div>
		);
	},
);

Canvas.displayName = "@react-sketch-canvas/Canvas";
