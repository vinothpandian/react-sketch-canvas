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

	it("converts page coordinates into canvas-relative coordinates", () => {
		const point = getCanvasPoint(
			{ pageX: 150, pageY: 220 },
			{ left: 100, top: 200 },
			{ scrollX: 10, scrollY: 20 },
		);

		expect(point).toEqual({ x: 40, y: 0 });
	});
});
