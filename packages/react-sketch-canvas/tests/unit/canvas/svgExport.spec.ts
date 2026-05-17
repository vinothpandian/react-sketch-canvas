import { describe, expect, it } from "vitest";
import { getCanvasWithViewBox } from "../../../src/Canvas/export/dom";
import { prepareSvgForExport } from "../../../src/Canvas/export/svg";

describe("canvas SVG export helpers", () => {
	it("clones the svg and applies explicit width, height, and viewBox", () => {
		const wrapper = document.createElement("div");
		Object.defineProperties(wrapper, {
			offsetWidth: { value: 320 },
			offsetHeight: { value: 180 },
		});
		wrapper.innerHTML = `<svg id="sketch"></svg>`;

		const result = getCanvasWithViewBox(wrapper);

		expect(result.width).toBe(320);
		expect(result.height).toBe(180);
		expect(result.svgCanvas.getAttribute("viewBox")).toBe("0 0 320 180");
		expect(result.svgCanvas.getAttribute("width")).toBe("320");
		expect(result.svgCanvas.getAttribute("height")).toBe("180");
	});

	it("keeps the background image pattern when exporting with background image", () => {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = `
			<defs><pattern id="canvas__background"></pattern></defs>
			<rect id="canvas__canvas-background" fill="url(#canvas__background)"></rect>
		`;

		prepareSvgForExport(svg, {
			id: "canvas",
			canvasColor: "white",
			exportWithBackgroundImage: true,
		});

		expect(svg.querySelector("#canvas__background")).not.toBeNull();
	});

	it("removes the background image pattern and restores canvas color when exporting without background image", () => {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = `
			<defs><pattern id="canvas__background"></pattern></defs>
			<rect id="canvas__canvas-background" fill="url(#canvas__background)"></rect>
		`;

		prepareSvgForExport(svg, {
			id: "canvas",
			canvasColor: "pink",
			exportWithBackgroundImage: false,
		});

		expect(svg.querySelector("#canvas__background")).toBeNull();
		expect(
			svg.querySelector("#canvas__canvas-background")?.getAttribute("fill"),
		).toBe("pink");
	});
});
