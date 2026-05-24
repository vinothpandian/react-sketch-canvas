import { describe, expect, it } from "vitest";
import {
	appendPointsToLastStroke,
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

		expect(appendPointsToLastStroke(paths, [{ x: 3, y: 4 }])[0].paths).toEqual([
			{ x: 1, y: 2 },
			{ x: 3, y: 4 },
		]);
	});

	it("appends multiple points to the last stroke in one update", () => {
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

		expect(
			appendPointsToLastStroke(paths, [
				{ x: 3, y: 4 },
				{ x: 5, y: 6 },
			])[0].paths,
		).toEqual([
			{ x: 1, y: 2 },
			{ x: 3, y: 4 },
			{ x: 5, y: 6 },
		]);
	});

	it("ignores a consecutive duplicate point when appending to the last stroke", () => {
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

		expect(appendPointsToLastStroke(paths, [{ x: 1, y: 2 }])).toBe(paths);
	});

	it("ignores consecutive duplicate points while appending a batch", () => {
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

		expect(
			appendPointsToLastStroke(paths, [
				{ x: 1, y: 2 },
				{ x: 3, y: 4 },
				{ x: 3, y: 4 },
				{ x: 5, y: 6 },
			])[0].paths,
		).toEqual([
			{ x: 1, y: 2 },
			{ x: 3, y: 4 },
			{ x: 5, y: 6 },
		]);
	});

	it("keeps an empty path list unchanged when appending a point", () => {
		const paths = [] as ReturnType<typeof createStroke>[];

		expect(appendPointsToLastStroke(paths, [{ x: 3, y: 4 }])).toBe(paths);
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

	it("keeps an empty path list unchanged when finishing a stroke", () => {
		const paths = [] as ReturnType<typeof createStroke>[];

		expect(finishStroke(paths, true, 250)).toBe(paths);
	});
});
