import { describe, expect, it } from "vitest";
import {
	getCanvasPoint,
	isAllowedPointerType,
	isPenEraser,
	shouldHandlePointerButton,
} from "../../../src/Canvas/hooks/useCanvasPointerHandlers";

describe("canvas pointer helpers", () => {
	it("allows all pointer types when configured as all", () => {
		expect(isAllowedPointerType("all", "mouse")).toBe(true);
		expect(isAllowedPointerType("all", "pen")).toBe(true);
		expect(isAllowedPointerType("all", "touch")).toBe(true);
	});

	it("rejects pointer types that do not match the configured type", () => {
		expect(isAllowedPointerType("pen", "mouse")).toBe(false);
		expect(isAllowedPointerType("pen", "pen")).toBe(true);
	});

	it("ignores non-primary mouse buttons", () => {
		expect(shouldHandlePointerButton("mouse", 0)).toBe(true);
		expect(shouldHandlePointerButton("mouse", 2)).toBe(false);
		expect(shouldHandlePointerButton("pen", 5)).toBe(true);
	});

	it("detects pen eraser button bit", () => {
		expect(isPenEraser("pen", 32)).toBe(true);
		expect(isPenEraser("pen", 64)).toBe(false);
		expect(isPenEraser("mouse", 32)).toBe(false);
	});

	it("converts viewport-relative pointer coordinates into canvas-relative coordinates", () => {
		const point = getCanvasPoint(
			{ clientX: 150, clientY: 220 },
			{ left: 100, top: 200, width: 300, height: 200 },
			{ offsetWidth: 300, offsetHeight: 200 },
		);

		expect(point).toEqual({ x: 50, y: 20 });
	});

	it("does not depend on the document scroll position", () => {
		// getBoundingClientRect() is viewport-relative and so is clientX/clientY,
		// so window scroll cancels out without us needing to read scrollX/scrollY.
		const scrolled = getCanvasPoint(
			{ clientX: 60, clientY: 80 },
			{ left: 10, top: 20, width: 300, height: 200 },
			{ offsetWidth: 300, offsetHeight: 200 },
		);

		expect(scrolled).toEqual({ x: 50, y: 60 });
	});

	it("divides out a uniformly scaled ancestor so points stay in the canvas's layout coordinate space", () => {
		// Canvas is 200x100 in layout, ancestor applies scale(1.5) so the rect
		// reports a 300x150 box. A pointer 75 visual px past the left edge sits
		// at canvas-x = 50 in the pre-transform coordinate system the SVG uses.
		const scaled = getCanvasPoint(
			{ clientX: 75, clientY: 60 },
			{ left: 0, top: 0, width: 300, height: 150 },
			{ offsetWidth: 200, offsetHeight: 100 },
		);

		expect(scaled).toEqual({ x: 50, y: 40 });
	});

	it("supports non-uniform scaling on each axis independently", () => {
		const scaled = getCanvasPoint(
			{ clientX: 80, clientY: 30 },
			{ left: 0, top: 0, width: 400, height: 60 },
			{ offsetWidth: 200, offsetHeight: 120 },
		);

		expect(scaled).toEqual({ x: 40, y: 60 });
	});

	it("falls back to no scaling when the rect or element size is degenerate", () => {
		const fallback = getCanvasPoint(
			{ clientX: 40, clientY: 60 },
			{ left: 10, top: 20, width: 0, height: 0 },
			{ offsetWidth: 0, offsetHeight: 0 },
		);

		expect(fallback).toEqual({ x: 30, y: 40 });
	});
});
