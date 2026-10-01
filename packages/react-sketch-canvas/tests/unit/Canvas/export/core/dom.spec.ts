import { describe, expect, it } from "vitest";
import { getCanvasWithViewBox } from "../../../../../src/Canvas/export/core/dom";

describe("canvas export DOM helpers", () => {
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

	it("keeps live viewBox bounds that extend past the wrapper", () => {
		const wrapper = document.createElement("div");
		Object.defineProperties(wrapper, {
			offsetWidth: { value: 500 },
			offsetHeight: { value: 500 },
		});
		wrapper.innerHTML = `<svg id="sketch" viewBox="-12 0 614 500"></svg>`;

		const result = getCanvasWithViewBox(wrapper);

		expect(result.width).toBe(500);
		expect(result.height).toBe(500);
		expect(result.svgCanvas.getAttribute("viewBox")).toBe("-12 0 614 500");
		expect(wrapper.querySelector("svg")?.getAttribute("viewBox")).toBe(
			"-12 0 614 500",
		);
	});

	it("uses wrapper dimensions when the live viewBox fits inside them", () => {
		const wrapper = document.createElement("div");
		Object.defineProperties(wrapper, {
			offsetWidth: { value: 500 },
			offsetHeight: { value: 500 },
		});
		wrapper.innerHTML = `<svg id="sketch" viewBox="0 0 498 498"></svg>`;

		const result = getCanvasWithViewBox(wrapper);

		expect(result.svgCanvas.getAttribute("viewBox")).toBe("0 0 500 500");
	});
});
