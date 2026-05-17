import type { CanvasPath } from "../../types";
import type { Operation } from "./operations";

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

export function undoState(state: SketchState): SketchState {
	if (state.historyPos <= 0) return state;
	const synced = addLastStrokeToHistory(state);

	return {
		...synced,
		currentPaths: synced.history[synced.historyPos - 1],
		historyPos: synced.historyPos - 1,
	};
}

export function redoState(state: SketchState): SketchState {
	if (state.historyPos >= state.history.length - 1) return state;
	const synced = addLastStrokeToHistory(state);

	return {
		...synced,
		currentPaths: synced.history[synced.historyPos + 1],
		historyPos: synced.historyPos + 1,
	};
}

export function clearCanvasState(state: SketchState): SketchState {
	const synced = addLastStrokeToHistory(state);

	return {
		...synced,
		currentPaths: [],
		history: [...synced.history.slice(0, synced.historyPos + 1), []],
		historyPos: synced.historyPos + 1,
	};
}

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

export function resetCanvasState(): SketchState {
	return {
		...createInitialSketchState(),
		history: [],
	};
}
