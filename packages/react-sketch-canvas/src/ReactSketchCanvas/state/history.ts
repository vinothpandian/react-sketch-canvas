import type { CanvasPath } from "../../types";
import type { Operation } from "./operations";

/**
 * Internal state model for `ReactSketchCanvas`.
 *
 * @remarks
 * `currentPaths` is the rendered drawing. `history` stores snapshots for
 * undo/redo. `operationQueue` serializes imperative ref operations so multiple
 * calls in the same render cycle are applied in order.
 */
export type SketchState = {
	drawMode: boolean;
	isDrawing: boolean;
	history: CanvasPath[][];
	historyPos: number;
	historySynced: boolean;
	currentPaths: CanvasPath[];
	operationQueue: Operation[];
	isProcessingQueue: boolean;
};

/**
 * Create the initial interactive drawing state.
 */
export function createInitialSketchState(): SketchState {
	return {
		drawMode: true,
		isDrawing: false,
		history: [[]],
		historyPos: 0,
		historySynced: false,
		currentPaths: [],
		operationQueue: [],
		isProcessingQueue: false,
	};
}

/**
 * Persist the current path list into history when it has not been synced yet.
 *
 * @remarks
 * Drawing mutates `currentPaths` first. History is synced lazily before the next
 * history operation so continuous pointer updates do not create one history
 * entry per point.
 */
export function addLastStrokeToHistory(state: SketchState): SketchState {
	if (state.historySynced) return state;

	return {
		...state,
		history: [
			...state.history.slice(0, state.historyPos),
			[...state.currentPaths],
		],
		historySynced: true,
	};
}

/**
 * Move the state one step backward in history.
 */
export function undoState(state: SketchState): SketchState {
	if (state.historyPos <= 0) return state;
	const synced = addLastStrokeToHistory(state);

	return {
		...synced,
		currentPaths: synced.history[synced.historyPos - 1],
		historyPos: synced.historyPos - 1,
	};
}

/**
 * Move the state one step forward in history.
 */
export function redoState(state: SketchState): SketchState {
	if (state.historyPos >= state.history.length - 1) return state;
	const synced = addLastStrokeToHistory(state);

	return {
		...synced,
		currentPaths: synced.history[synced.historyPos + 1],
		historyPos: synced.historyPos + 1,
	};
}

/**
 * Clear rendered paths while preserving undo history.
 */
export function clearCanvasState(state: SketchState): SketchState {
	const synced = addLastStrokeToHistory(state);

	return {
		...synced,
		currentPaths: [],
		history: [...synced.history.slice(0, synced.historyPos + 1), []],
		historyPos: synced.historyPos + 1,
	};
}

/**
 * Append externally supplied paths and add the result to history.
 */
export function loadPathsState(
	state: SketchState,
	paths: CanvasPath[],
): SketchState {
	const synced = addLastStrokeToHistory(state);
	const newPaths = [...synced.currentPaths, ...paths];
	const newHistoryPos = synced.historyPos + 1;

	return {
		...synced,
		currentPaths: newPaths,
		history: [...synced.history.slice(0, newHistoryPos), newPaths],
		historyPos: newHistoryPos,
	};
}

/**
 * Reset paths, history, drawing mode, and queued operations to a fresh canvas.
 */
export function resetCanvasState(): SketchState {
	return {
		...createInitialSketchState(),
		history: [],
	};
}
