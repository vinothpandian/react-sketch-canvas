import { describe, expect, it } from "vitest";
import {
	appendPointToLastStroke,
	createStroke,
	finishStroke,
} from "../../../src/ReactSketchCanvas/state/strokes";

describe("stroke state helpers", () => {
	it("creates a draw stroke", () => {
		expect(
			createStroke({
				point: { x: 1, y: 2 },
				drawMode: true,
				strokeColor: "red",
				strokeWidth: 4,
				eraserWidth: 8,
				withTimestamp: false,
				now: 100,
			}),
		).toEqual({
			drawMode: true,
			strokeColor: "red",
			strokeWidth: 4,
			paths: [{ x: 1, y: 2 }],
		});
	});

	it("creates an eraser stroke when draw mode is false", () => {
		expect(
			createStroke({
				point: { x: 1, y: 2 },
				drawMode: false,
				strokeColor: "red",
				strokeWidth: 4,
				eraserWidth: 8,
				withTimestamp: true,
				now: 100,
			}),
		).toEqual({
			drawMode: false,
			strokeColor: "#000000",
			strokeWidth: 8,
			paths: [{ x: 1, y: 2 }],
			startTimestamp: 100,
			endTimestamp: 0,
		});
	});

	it("appends a point to the last stroke", () => {
		const paths = [
			createStroke({
				point: { x: 1, y: 2 },
				drawMode: true,
				strokeColor: "red",
				strokeWidth: 4,
				eraserWidth: 8,
				withTimestamp: false,
				now: 100,
			}),
		];

		expect(appendPointToLastStroke(paths, { x: 3, y: 4 })[0].paths).toEqual([
			{ x: 1, y: 2 },
			{ x: 3, y: 4 },
		]);
	});

	it("finishes timestamped last stroke", () => {
		const paths = [
			createStroke({
				point: { x: 1, y: 2 },
				drawMode: true,
				strokeColor: "red",
				strokeWidth: 4,
				eraserWidth: 8,
				withTimestamp: true,
				now: 100,
			}),
		];

		expect(finishStroke(paths, true, 250)[0].endTimestamp).toBe(250);
		expect(finishStroke(paths, false, 250)[0].endTimestamp).toBe(0);
	});
});
