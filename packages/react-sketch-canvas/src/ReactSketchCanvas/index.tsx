import * as React from "react";
import { Canvas } from "../Canvas";
import type { CanvasRef } from "../Canvas/types";
import type { CanvasPath } from "../types";
import { useSketchCanvasController } from "./hooks/useSketchCanvasController";
import { useSketchCanvasImperativeHandle } from "./hooks/useSketchCanvasImperativeHandle";
import type { ReactSketchCanvasProps, ReactSketchCanvasRef } from "./types";

/**
 * ReactSketchCanvas is a wrapper around Canvas component to provide a controlled way to manage the canvas paths.
 * It provides a set of methods to manage the canvas paths, undo, redo, clear and reset the canvas.
 *
 * @param props - Props for the ReactSketchCanvas component
 * @param ref - Reference to the ReactSketchCanvas component
 *
 * @returns ReactSketchCanvas component
 */
export const ReactSketchCanvas = React.forwardRef<
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
