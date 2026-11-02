import { render } from "@testing-library/react";
import type * as React from "react";
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

	describe("touch-action", () => {
		const renderCanvas = (
			props: Partial<React.ComponentProps<typeof Canvas>> = {},
		) =>
			render(
				<Canvas
					paths={[]}
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
					{...props}
				/>,
			).container.firstElementChild as HTMLElement;

		it("lets two fingers scroll the page while one finger draws by default", () => {
			expect(renderCanvas().style.touchAction).toBe("pinch-zoom");
		});

		it("blocks every touch gesture when allowMultiTouchScroll is false", () => {
			expect(
				renderCanvas({ allowMultiTouchScroll: false }).style.touchAction,
			).toBe("none");
		});

		it("keeps pen-only and mouse-only canvases scrollable by touch", () => {
			for (const allowOnlyPointerType of ["pen", "mouse"] as const) {
				expect(renderCanvas({ allowOnlyPointerType }).style.touchAction).toBe(
					"pan-x pan-y pinch-zoom",
				);
			}
		});

		it("prefers an explicit touchAction over allowMultiTouchScroll", () => {
			expect(
				renderCanvas({ touchAction: "pan-y", allowMultiTouchScroll: false })
					.style.touchAction,
			).toBe("pan-y");
		});
	});
});
