import { describe, expect, it } from "vitest";
import {
	bezierCommand,
	doesEraserStrokeHitStroke,
	line,
} from "../../../src/Paths/geometry";
import type { CanvasPath } from "../../../src/types";

function path(paths: CanvasPath["paths"], strokeWidth = 4): CanvasPath {
	return {
		paths,
		strokeWidth,
		strokeColor: "red",
		drawMode: true,
	};
}

describe("Paths geometry", () => {
	it("measures the length and angle between two points", () => {
		const segment = line({ x: 0, y: 0 }, { x: 3, y: 4 });

		expect(segment.length).toBe(5);
		expect(segment.angle).toBeCloseTo(Math.atan2(4, 3));
	});

	it("builds a smooth cubic bezier command from neighboring points", () => {
		const command = bezierCommand({ x: 10, y: 0 }, 1, [
			{ x: 0, y: 0 },
			{ x: 10, y: 0 },
			{ x: 20, y: 10 },
		]);

		expect(command.startsWith("C ")).toBe(true);
		expect(command.endsWith(" 10, 0")).toBe(true);
		expect(command).toMatch(/^C [^ ]+ [^ ]+ 10, 0$/);
	});

	it("detects crossing eraser and drawing segments", () => {
		const eraser = path(
			[
				{ x: 5, y: -10 },
				{ x: 5, y: 10 },
			],
			8,
		);
		const stroke = path([
			{ x: 0, y: 0 },
			{ x: 10, y: 0 },
		]);

		expect(doesEraserStrokeHitStroke({ eraser, stroke })).toBe(true);
	});

	it("does not hit a drawing segment outside the eraser radius", () => {
		const eraser = path(
			[
				{ x: 0, y: 0 },
				{ x: 10, y: 0 },
			],
			8,
		);
		const stroke = path(
			[
				{ x: 0, y: 9 },
				{ x: 10, y: 9 },
			],
			4,
		);

		expect(doesEraserStrokeHitStroke({ eraser, stroke })).toBe(false);
	});

	it("detects single-point drawing strokes inside the swept eraser stroke", () => {
		const eraser = path(
			[
				{ x: 0, y: 0 },
				{ x: 10, y: 0 },
			],
			8,
		);
		const stroke = path([{ x: 5, y: 5 }], 4);

		expect(doesEraserStrokeHitStroke({ eraser, stroke })).toBe(true);
	});

	it("includes half of the target stroke width in the hit threshold", () => {
		const eraser = path(
			[
				{ x: 0, y: 0 },
				{ x: 10, y: 0 },
			],
			8,
		);
		const stroke = path(
			[
				{ x: 0, y: 6 },
				{ x: 10, y: 6 },
			],
			4,
		);

		expect(doesEraserStrokeHitStroke({ eraser, stroke })).toBe(true);
	});
});
