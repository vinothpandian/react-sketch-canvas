import { describe, expect, it } from "vitest";
import { getCanvasWithViewBox } from "../../../src/Canvas/export/core/dom";
import { prepareSvgForExport } from "../../../src/Canvas/export/svg/svg";

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

		const exported = prepareSvgForExport(svg, {
			id: "canvas",
			canvasColor: "white",
			exportWithBackgroundImage: true,
		});

		expect(exported.outerHTML).toContain("__background");
	});

	it("removes the background image pattern and restores canvas color when exporting without background image", () => {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = `
			<defs><pattern id="canvas__background"></pattern></defs>
			<rect id="canvas__canvas-background" fill="url(#canvas__background)"></rect>
		`;

		const exported = prepareSvgForExport(svg, {
			id: "canvas",
			canvasColor: "pink",
			exportWithBackgroundImage: false,
		});

		expect(exported.outerHTML).not.toContain('id="canvas__background"');
		expect(exported.outerHTML).toContain('fill="pink"');
	});

	it("removes internally isolated background ids when exporting without background image", () => {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = `
			<defs><pattern id="canvas__r0__background"></pattern></defs>
			<rect id="canvas__r0__canvas-background" fill="url(#canvas__r0__background)"></rect>
		`;

		const exported = prepareSvgForExport(svg, {
			id: "canvas",
			canvasColor: "pink",
			exportWithBackgroundImage: false,
		});

		expect(exported.outerHTML).not.toContain('id="canvas__r0__background"');
		expect(exported.outerHTML).not.toContain("url(#canvas__r0__background)");
		expect(exported.outerHTML).toContain('fill="pink"');
	});

	it("rewrites internal ids and references so exported SVG markup does not collide with the live canvas", () => {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = `
			<defs>
				<pattern id="canvas__background"></pattern>
				<mask id="canvas__eraser-mask-0">
					<use href="#canvas__mask-background" xlink:href="#canvas__mask-background"></use>
				</mask>
			</defs>
			<rect id="canvas__mask-background" fill="white"></rect>
			<g id="canvas__stroke-group-0" mask="url(#canvas__eraser-mask-0)"></g>
		`;

		const exported = prepareSvgForExport(svg, {
			id: "canvas",
			canvasColor: "white",
			exportWithBackgroundImage: true,
		});
		const output = exported.outerHTML;

		expect(output).not.toContain('id="canvas__eraser-mask-0"');
		expect(output).not.toContain('href="#canvas__mask-background"');
		expect(output).not.toContain('mask="url(#canvas__eraser-mask-0)"');
		expect(output).toMatch(/mask="url\(#canvas__export-[^"]+\)"/);
		expect(output).toMatch(/href="#canvas__export-[^"]+"/);
	});
});
