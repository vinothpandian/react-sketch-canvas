import * as React from "react";
import type { CanvasRef } from "../../Canvas/types";
import type {
	CanvasPath,
	ExportImageOptions,
	ExportImageType,
} from "../../types";
import type { Operation } from "../state/operations";
import { getSketchingTime } from "../state/sketchingTime";
import type { ReactSketchCanvasRef } from "../types";

type UseSketchCanvasImperativeHandleParams = {
	canvasRef: React.RefObject<CanvasRef | null>;
	currentPaths: CanvasPath[];
	withTimestamp: boolean;
	setEraseMode: (erase: boolean) => void;
	enqueueOperation: (operation: Operation) => void;
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
		enqueueOperation,
		resetCanvas,
	}: UseSketchCanvasImperativeHandleParams,
): UseSketchCanvasImperativeHandleReturns {
	React.useImperativeHandle(
		ref,
		() => ({
			eraseMode: setEraseMode,
			clearCanvas: (): void => {
				enqueueOperation({ type: "clear" });
			},
			undo: (): void => {
				enqueueOperation({ type: "undo" });
			},
			redo: (): void => {
				enqueueOperation({ type: "redo" });
			},
			exportImage: (
				imageType: ExportImageType,
				options?: ExportImageOptions,
			): Promise<string> => {
				const exportImage = canvasRef.current?.exportImage;

				if (!exportImage) {
					throw Error("Export function called before canvas loaded");
				}

				return exportImage(imageType, options);
			},
			exportSvg: async (): Promise<string> => {
				const exportSvg = canvasRef.current?.exportSvg;

				if (!exportSvg) {
					throw Error("Export function called before canvas loaded");
				}

				return exportSvg();
			},
			exportPaths: async (): Promise<CanvasPath[]> => currentPaths,
			loadPaths: (paths: CanvasPath[]): void => {
				enqueueOperation({ type: "loadPaths", payload: paths });
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
			enqueueOperation,
			resetCanvas,
			setEraseMode,
			withTimestamp,
		],
	);
}
