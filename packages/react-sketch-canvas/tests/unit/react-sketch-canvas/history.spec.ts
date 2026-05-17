import { describe, expect, it } from "vitest";
import {
	addLastStrokeToHistory,
	clearCanvasState,
	createInitialSketchState,
	loadPathsState,
	redoState,
	resetCanvasState,
	undoState,
} from "../../../src/ReactSketchCanvas/state/history";
import type { CanvasPath } from "../../../src/types";

const path = (strokeColor: string): CanvasPath => ({
	drawMode: true,
	strokeColor,
	strokeWidth: 4,
	paths: [{ x: 0, y: 0 }],
});

describe("history state", () => {
	it("adds the current paths to history only when unsynced", () => {
		const state = {
			...createInitialSketchState(),
			currentPaths: [path("red")],
			historyPos: 1,
			historySynced: false,
		};

		expect(addLastStrokeToHistory(state).history).toEqual([[], [path("red")]]);
		expect(
			addLastStrokeToHistory({ ...state, historySynced: true }).history,
		).toEqual([[]]);
	});

	it("undoes and redoes through existing history", () => {
		const state = {
			...createInitialSketchState(),
			history: [[], [path("red")], [path("red"), path("blue")]],
			historyPos: 2,
			currentPaths: [path("red"), path("blue")],
			historySynced: true,
		};

		const undone = undoState(state);
		expect(undone.currentPaths).toEqual([path("red")]);
		expect(undone.historyPos).toBe(1);

		const redone = redoState(undone);
		expect(redone.currentPaths).toEqual([path("red"), path("blue")]);
		expect(redone.historyPos).toBe(2);
	});

	it("clear appends an empty history entry", () => {
		const state = {
			...createInitialSketchState(),
			currentPaths: [path("red")],
			historyPos: 1,
			historySynced: false,
		};

		const cleared = clearCanvasState(state);

		expect(cleared.currentPaths).toEqual([]);
		expect(cleared.history).toEqual([[], [path("red")], []]);
		expect(cleared.historyPos).toBe(2);
	});

	it("loadPaths appends to current paths to preserve existing behavior", () => {
		const loaded = loadPathsState(
			{ ...createInitialSketchState(), currentPaths: [path("red")] },
			[path("blue")],
		);

		expect(loaded.currentPaths).toEqual([path("red"), path("blue")]);
	});

	it("reset clears paths, history, and operation queue state", () => {
		expect(resetCanvasState().history).toEqual([]);
		expect(resetCanvasState().historyPos).toBe(0);
		expect(resetCanvasState().currentPaths).toEqual([]);
		expect(resetCanvasState().operationQueue).toEqual([]);
	});
});
