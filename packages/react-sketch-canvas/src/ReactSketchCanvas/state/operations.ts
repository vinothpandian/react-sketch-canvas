import type { CanvasPath } from "../../types";
import type { SketchState } from "./history";
import {
	clearCanvasState,
	loadPathsState,
	redoState,
	undoState,
} from "./history";

/**
 * Queued imperative operation requested through `ReactSketchCanvasRef`.
 */
export type Operation = {
	type: "undo" | "redo" | "clear" | "loadPaths";
	payload?: CanvasPath[];
};

/**
 * Add an imperative operation to the end of the state queue.
 */
export function enqueueOperation(
	state: SketchState,
	operation: Operation,
): SketchState {
	return {
		...state,
		operationQueue: [...state.operationQueue, operation],
	};
}

/**
 * Apply a queued operation to sketch state.
 *
 * @remarks
 * Keeping this function pure makes imperative behavior easy to test without
 * rendering React components.
 */
export function applyOperation(
	state: SketchState,
	operation: Operation,
): SketchState {
	switch (operation.type) {
		case "undo":
			return undoState(state);
		case "redo":
			return redoState(state);
		case "clear":
			return clearCanvasState(state);
		case "loadPaths":
			return operation.payload
				? loadPathsState(state, operation.payload)
				: state;
		default:
			throw new Error(
				`Unknown operation type: ${(operation as Operation).type}`,
			);
	}
}
