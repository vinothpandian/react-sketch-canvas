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
			{ left: 100, top: 200 },
		);

		expect(point).toEqual({ x: 50, y: 20 });
	});

	it("does not depend on the document scroll position", () => {
		// getBoundingClientRect() is viewport-relative and so is clientX/clientY,
		// so window scroll cancels out without us needing to read scrollX/scrollY.
		const scrolled = getCanvasPoint(
			{ clientX: 60, clientY: 80 },
			{ left: 10, top: 20 },
		);

		expect(scrolled).toEqual({ x: 50, y: 60 });
	});
});
