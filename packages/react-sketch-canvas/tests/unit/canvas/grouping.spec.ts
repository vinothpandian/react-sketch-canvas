import { describe, expect, it } from "vitest";
import {
	getEraserPaths,
	getPathGroups,
} from "../../../src/Canvas/svg/grouping";
import type { CanvasPath } from "../../../src/types";

const draw = (id: number): CanvasPath => ({
	drawMode: true,
	strokeColor: `draw-${id}`,
	strokeWidth: id,
	paths: [{ x: id, y: id }],
});

const erase = (id: number): CanvasPath => ({
	drawMode: false,
	strokeColor: "#000000",
	strokeWidth: id,
	paths: [{ x: id, y: id }],
});

describe("canvas SVG grouping", () => {
	it("returns only eraser paths", () => {
		expect(getEraserPaths([draw(1), erase(2), draw(3), erase(4)])).toEqual([
			erase(2),
			erase(4),
		]);
	});

	it("groups draw paths between eraser strokes", () => {
		expect(
			getPathGroups([draw(1), draw(2), erase(3), draw(4), erase(5)]),
		).toEqual([[draw(1), draw(2)], [draw(4)]]);
	});

	it("keeps an initial empty group when the first stroke is an eraser", () => {
		expect(getPathGroups([erase(1), draw(2)])).toEqual([[], [draw(2)]]);
	});

	it("does not create a trailing empty group after the last stroke is an eraser", () => {
		expect(getPathGroups([draw(1), erase(2)])).toEqual([[draw(1)]]);
	});
});
