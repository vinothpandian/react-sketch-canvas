import * as React from "react";
import { Canvas } from "../Canvas";
import type { CanvasRef } from "../Canvas/types";
import type { CanvasPath } from "../types";
import { useSketchCanvasController } from "./hooks/useSketchCanvasController";
import { useSketchCanvasImperativeHandle } from "./hooks/useSketchCanvasImperativeHandle";
import type { ReactSketchCanvasProps, ReactSketchCanvasRef } from "./types";

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
		eraserMode = "mask",
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
		touchAction,
	} = props;

	const svgCanvas = React.useRef<CanvasRef>(null);
	const {
		currentPaths,
		isDrawing,
		undo,
		redo,
		clearCanvas,
		loadPaths,
		resetCanvas,
		setEraseMode,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
	} = useSketchCanvasController({
		strokeColor,
		strokeWidth,
		eraserWidth,
		eraserMode,
		withTimestamp,
		onChange,
		onStroke,
	});

	useSketchCanvasImperativeHandle(ref, {
		canvasRef: svgCanvas,
		currentPaths,
		withTimestamp,
		setEraseMode,
		undo,
		redo,
		clearCanvas,
		loadPaths,
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
			touchAction={touchAction}
		/>
	);
});

ReactSketchCanvas.displayName = "@react-sketch-canvas/ReactSketchCanvas";
