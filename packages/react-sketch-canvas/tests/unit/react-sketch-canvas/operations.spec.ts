import { describe, expect, it } from "vitest";
import { createInitialSketchState } from "../../../src/ReactSketchCanvas/state/history";
import {
	applyOperation,
	enqueueOperation,
} from "../../../src/ReactSketchCanvas/state/operations";
import type { CanvasPath } from "../../../src/types";

const path = (strokeColor: string): CanvasPath => ({
	drawMode: true,
	strokeColor,
	strokeWidth: 4,
	paths: [{ x: 0, y: 0 }],
});

describe("operations", () => {
	it("enqueues operations in order", () => {
		expect(
			enqueueOperation(createInitialSketchState(), { type: "clear" })
				.operationQueue,
		).toEqual([{ type: "clear" }]);
	});

	it("applies loadPaths operation", () => {
		const next = applyOperation(createInitialSketchState(), {
			type: "loadPaths",
			payload: [path("red")],
		});

		expect(next.currentPaths).toEqual([path("red")]);
	});

	it("throws on unknown operations", () => {
		expect(() =>
			applyOperation(createInitialSketchState(), { type: "unknown" } as never),
		).toThrow("Unknown operation type: unknown");
	});
});
