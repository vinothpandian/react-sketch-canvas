import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReactSketchCanvas } from "../../../src";

describe("ReactSketchCanvas", () => {
	it("renders an svg canvas with the provided id", () => {
		render(<ReactSketchCanvas id="unit-canvas" width="320px" height="180px" />);

		const canvas = document.querySelector("svg#unit-canvas");

		expect(canvas).toBeInstanceOf(SVGElement);
		expect(canvas?.parentElement?.getAttribute("style")).toContain(
			"width: 320px",
		);
		expect(canvas?.parentElement?.getAttribute("style")).toContain(
			"height: 180px",
		);
		expect(canvas?.parentElement?.getAttribute("style")).toContain(
			"touch-action: none",
		);
		expect(canvas?.parentElement?.getAttribute("style")).toContain(
			"user-select: none",
		);
	});

	it("allows browser panning and zooming for non-pen input in pen-only mode", () => {
		render(
			<ReactSketchCanvas
				id="pen-canvas"
				width="320px"
				height="180px"
				allowOnlyPointerType="pen"
			/>,
		);

		const canvas = document.querySelector("svg#pen-canvas");

		expect(canvas?.parentElement?.getAttribute("style")).toContain(
			"touch-action: pan-x pan-y pinch-zoom",
		);
	});

	it("allows browser panning and zooming for touch input in mouse-only mode", () => {
		render(
			<ReactSketchCanvas
				id="mouse-canvas"
				width="320px"
				height="180px"
				allowOnlyPointerType="mouse"
			/>,
		);

		const canvas = document.querySelector("svg#mouse-canvas");

		expect(canvas?.parentElement?.getAttribute("style")).toContain(
			"touch-action: pan-x pan-y pinch-zoom",
		);
	});
});
