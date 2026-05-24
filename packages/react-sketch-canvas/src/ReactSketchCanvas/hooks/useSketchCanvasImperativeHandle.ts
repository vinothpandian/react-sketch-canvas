import * as React from "react";
import type { CanvasRef } from "../../Canvas/types";
import type {
	CanvasPath,
	ExportImageOptions,
	ExportImageType,
} from "../../types";
import { getSketchingTime } from "../state/sketchingTime";
import type { ReactSketchCanvasRef } from "../types";

type UseSketchCanvasImperativeHandleParams = {
	canvasRef: React.RefObject<CanvasRef | null>;
	currentPaths: CanvasPath[];
	withTimestamp: boolean;
	setEraseMode: (erase: boolean) => void;
	undo: () => void;
	redo: () => void;
	clearCanvas: () => void;
	loadPaths: (paths: CanvasPath[]) => void;
	resetCanvas: () => void;
};

type UseSketchCanvasImperativeHandleReturns = ReturnType<() => void>;

/**
 * Expose the public `ReactSketchCanvas` imperative API.
 *
 * @remarks
 * This hook adapts the low-level canvas export ref and the state controller into
 * the user-facing methods documented by `ReactSketchCanvasRef`.
 */
export function useSketchCanvasImperativeHandle(
	ref: React.ForwardedRef<ReactSketchCanvasRef>,
	{
		canvasRef,
		currentPaths,
		withTimestamp,
		setEraseMode,
		undo,
		redo,
		clearCanvas,
		loadPaths,
		resetCanvas,
	}: UseSketchCanvasImperativeHandleParams,
): UseSketchCanvasImperativeHandleReturns {
	React.useImperativeHandle(
		ref,
		() => ({
			eraseMode: setEraseMode,
			clearCanvas: (): void => {
				clearCanvas();
			},
			undo: (): void => {
				undo();
			},
			redo: (): void => {
				redo();
			},
			exportImage: (
				imageType: ExportImageType,
				options?: ExportImageOptions,
			): Promise<string> => {
				const exportImage = canvasRef.current?.exportImage;

				if (!exportImage) {
					throw new Error(
						"Cannot export: the canvas is not ready yet. Wait until the component has mounted before calling exportImage().",
					);
				}

				return exportImage(imageType, options);
			},
			exportSvg: async (): Promise<string> => {
				const exportSvg = canvasRef.current?.exportSvg;

				if (!exportSvg) {
					throw new Error(
						"Cannot export: the canvas is not ready yet. Wait until the component has mounted before calling exportSvg().",
					);
				}

				return exportSvg();
			},
			exportPaths: async (): Promise<CanvasPath[]> => currentPaths,
			loadPaths: (paths: CanvasPath[]): void => {
				loadPaths(paths);
			},
			getSketchingTime: async (): Promise<number> => {
				if (!withTimestamp) {
					throw new Error("Set 'withTimestamp' prop to get sketching time");
				}

				return getSketchingTime(currentPaths);
			},
			resetCanvas,
		}),
		[
			canvasRef,
			currentPaths,
			undo,
			redo,
			clearCanvas,
			loadPaths,
			resetCanvas,
			setEraseMode,
			withTimestamp,
		],
	);
}
