import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Canvas } from "../../../src/Canvas";
import type { CanvasPath } from "../../../src/types";

const loadedPath: CanvasPath = {
	drawMode: true,
	strokeColor: "red",
	strokeWidth: 4,
	paths: [
		{ x: 20, y: 30 },
		{ x: 80, y: 90 },
	],
};

describe("Canvas", () => {
	it("initializes viewBox from rendered geometry when paths are loaded before drawing", async () => {
		const getBoundingClientRect = vi
			.spyOn(HTMLElement.prototype, "getBoundingClientRect")
			.mockReturnValue({
				left: 0,
				top: 0,
				width: 320,
				height: 180,
			} as DOMRect);

		render(
			<Canvas
				paths={[loadedPath]}
				isDrawing={false}
				onPointerDown={vi.fn()}
				onPointerMove={vi.fn()}
				onPointerUp={vi.fn()}
				allowOnlyPointerType="all"
				backgroundImage=""
				canvasColor="white"
				exportWithBackgroundImage={false}
				height="180px"
				preserveBackgroundImageAspectRatio="none"
				style={{}}
				svgStyle={{}}
				width="320px"
				withViewBox
			/>,
		);

		await Promise.resolve();

		expect(document.querySelector("svg")?.getAttribute("viewBox")).toBe(
			"0 0 320 180",
		);
		getBoundingClientRect.mockRestore();
	});
});
