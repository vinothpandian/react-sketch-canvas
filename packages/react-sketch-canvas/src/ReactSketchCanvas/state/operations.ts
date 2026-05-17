import type { CanvasPath } from "../../types";
import type { SketchState } from "./history";
import {
	clearCanvasState,
	loadPathsState,
	redoState,
	undoState,
} from "./history";

export type Operation = {
	type: "undo" | "redo" | "clear" | "loadPaths";
	payload?: CanvasPath[];
};

export function enqueueOperation(
	state: SketchState,
	operation: Operation,
): SketchState {
	return {
		...state,
		operationQueue: [...state.operationQueue, operation],
	};
}

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
