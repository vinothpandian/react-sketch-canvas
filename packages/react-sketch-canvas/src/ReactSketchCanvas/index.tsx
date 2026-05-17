import * as React from "react";
import { Canvas } from "../Canvas";
import type { CanvasRef } from "../Canvas/types";
import type { CanvasPath } from "../types";
import { useSketchCanvasController } from "./hooks/useSketchCanvasController";
import { useSketchCanvasImperativeHandle } from "./hooks/useSketchCanvasImperativeHandle";
import type { ReactSketchCanvasProps, ReactSketchCanvasRef } from "./types";

/**
 * Type of the stateful sketch canvas component.
 *
 * @remarks
 * Keeping this explicit makes the generated declarations show the composed
 * props and ref types used by the public React component.
 */
type ReactSketchCanvasComponent = React.ForwardRefExoticComponent<
	ReactSketchCanvasProps & React.RefAttributes<ReactSketchCanvasRef>
>;

/**
 * Stateful sketch canvas component for freehand SVG drawing.
 *
 * @remarks
 * `ReactSketchCanvas` manages paths, draw/erase mode, undo/redo history,
 * timestamp capture, and public imperative methods. It is the primary component
 * intended for application use.
 *
 * Use a ref when you need to export images or paths, toggle erasing from a
 * toolbar, or control history from parent UI.
 *
 * @param props - Public drawing, styling, export, and callback options.
 * @param ref - Ref exposing {@link ReactSketchCanvasRef} methods.
 * @returns The sketch canvas component.
 *
 * @public
 */
export const ReactSketchCanvas: ReactSketchCanvasComponent = React.forwardRef<
	ReactSketchCanvasRef,
	ReactSketchCanvasProps
>((props, ref) => {
	const {
		id = "react-sketch-canvas",
		width = "100%",
		height = "100%",
		className = "",
		canvasColor = "white",
		strokeColor = "red",
		backgroundImage = "",
		exportWithBackgroundImage = false,
		preserveBackgroundImageAspectRatio = "none",
		strokeWidth = 4,
		eraserWidth = 8,
		allowOnlyPointerType = "all",
		style = {
			border: "0.0625rem solid lightgray",
			borderRadius: "0.25rem",
		},
		svgStyle = {},
		onChange = (_paths: CanvasPath[]): void => undefined,
		onStroke = (_path: CanvasPath, _isEraser: boolean): void => undefined,
		withTimestamp = false,
		withViewBox = false,
		readOnly = false,
	} = props;

	const svgCanvas = React.createRef<CanvasRef>();
	const {
		currentPaths,
		isDrawing,
		enqueueOperation,
		resetCanvas,
		setEraseMode,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
	} = useSketchCanvasController({
		strokeColor,
		strokeWidth,
		eraserWidth,
		withTimestamp,
		onChange,
		onStroke,
	});

	useSketchCanvasImperativeHandle(ref, {
		canvasRef: svgCanvas,
		currentPaths,
		withTimestamp,
		setEraseMode,
		enqueueOperation,
		resetCanvas,
	});

	return (
		<Canvas
			ref={svgCanvas}
			id={id}
			width={width}
			height={height}
			className={className}
			canvasColor={canvasColor}
			backgroundImage={backgroundImage}
			exportWithBackgroundImage={exportWithBackgroundImage}
			preserveBackgroundImageAspectRatio={preserveBackgroundImageAspectRatio}
			allowOnlyPointerType={allowOnlyPointerType}
			style={style}
			svgStyle={svgStyle}
			paths={currentPaths}
			isDrawing={isDrawing}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			withViewBox={withViewBox}
			readOnly={readOnly}
		/>
	);
});

ReactSketchCanvas.displayName = "@react-sketch-canvas/ReactSketchCanvas";
