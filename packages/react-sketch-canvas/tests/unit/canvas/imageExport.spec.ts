import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportImageFromSvg } from "../../../src/Canvas/export/image";

class MockImage {
	static instances: MockImage[] = [];

	static failingSources = new Set<string>();

	public width = 100;

	public onload: (() => void) | null = null;

	public onerror: ((error: Error) => void) | null = null;

	public attributes = new Map<string, string>();

	public crossOrigin: string | null = null;

	private listeners = new Map<string, Array<() => void>>();

	private _src = "";

	public constructor() {
		MockImage.instances.push(this);
	}

	public addEventListener(event: string, listener: () => void) {
		const listeners = this.listeners.get(event) ?? [];
		listeners.push(listener);
		this.listeners.set(event, listeners);
	}

	public setAttribute(name: string, value: string) {
		this.attributes.set(name, value);
	}

	public get src() {
		return this._src;
	}

	public set src(value: string) {
		this._src = value;
		queueMicrotask(() => {
			if (MockImage.failingSources.has(value)) {
				for (const listener of this.listeners.get("error") ?? []) {
					listener();
				}

				return;
			}

			for (const listener of this.listeners.get("load") ?? []) {
				listener();
			}
		});
	}
}

function decodeSvgDataUri(dataUri: string) {
	const [, encodedSvg = ""] = dataUri.split("base64,");
	return atob(encodedSvg);
}

describe("exportImageFromSvg", () => {
	const originalImage = globalThis.Image;
	const originalGetContext = HTMLCanvasElement.prototype.getContext;
	const originalToDataUrl = HTMLCanvasElement.prototype.toDataURL;
	const drawImage = vi.fn();
	const fillRect = vi.fn();

	beforeEach(() => {
		MockImage.instances = [];
		MockImage.failingSources = new Set();
		drawImage.mockReset();
		fillRect.mockReset();
		globalThis.Image = MockImage as unknown as typeof Image;
		HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
			drawImage,
			fillRect,
			fillStyle: "",
		})) as unknown as typeof HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.toDataURL = vi.fn(
			(type: string) => `data:${type};base64,export`,
		);
	});

	afterEach(() => {
		globalThis.Image = originalImage;
		HTMLCanvasElement.prototype.getContext = originalGetContext;
		HTMLCanvasElement.prototype.toDataURL = originalToDataUrl;
	});

	it("removes background-image markup from the serialized SVG when exporting without the background image", async () => {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = `
			<defs><pattern id="canvas__background"><image href="data:image/png;base64,bg" /></pattern></defs>
			<rect id="canvas__canvas-background" fill="url(#canvas__background)"></rect>
			<g id="canvas__stroke-group-0"></g>
		`;

		await exportImageFromSvg({
			id: "canvas",
			svgCanvas: svg,
			svgWidth: 320,
			svgHeight: 180,
			imageType: "png",
			canvasColor: "#abcdef",
			backgroundImage: "data:image/png;base64,bg",
			exportWithBackgroundImage: false,
		});

		const [strokeImage] = MockImage.instances;
		const serializedSvg = decodeSvgDataUri(strokeImage.src);

		expect(serializedSvg).not.toContain("canvas__background");
		expect(serializedSvg).not.toContain("data:image/png;base64,bg");
		expect(fillRect).toHaveBeenCalledWith(0, 0, 320, 180);
		expect(MockImage.instances).toHaveLength(1);
	});

	it("exports the background image as a separate raster layer to avoid duplicate SVG artifacts", async () => {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = `
			<defs><pattern id="canvas__background"><image href="https://example.com/bg.png" /></pattern></defs>
			<rect id="canvas__canvas-background" fill="url(#canvas__background)"></rect>
			<g id="canvas__stroke-group-0"></g>
		`;

		await exportImageFromSvg({
			id: "canvas",
			svgCanvas: svg,
			svgWidth: 200,
			svgHeight: 100,
			imageType: "jpeg",
			canvasColor: "white",
			backgroundImage: "https://example.com/bg.png",
			exportWithBackgroundImage: true,
		});

		const [strokeImage, backgroundLayer] = MockImage.instances;
		const serializedSvg = decodeSvgDataUri(strokeImage.src);

		expect(serializedSvg).not.toContain("canvas__background");
		expect(serializedSvg).not.toContain("https://example.com/bg.png");
		expect(backgroundLayer.crossOrigin).toBe("anonymous");
		expect(backgroundLayer.src).toBe("https://example.com/bg.png");
		expect(drawImage).toHaveBeenNthCalledWith(
			1,
			backgroundLayer,
			0,
			0,
			200,
			100,
		);
		expect(drawImage).toHaveBeenNthCalledWith(2, strokeImage, 0, 0, 200, 100);
	});

	it("keeps data URL background images in the serialized SVG layer", async () => {
		const backgroundImage = "data:image/png;base64,bg";
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = `
			<defs><pattern id="canvas__background"><image href="${backgroundImage}" /></pattern></defs>
			<rect id="canvas__canvas-background" fill="url(#canvas__background)"></rect>
			<g id="canvas__stroke-group-0"></g>
		`;

		await exportImageFromSvg({
			id: "canvas",
			svgCanvas: svg,
			svgWidth: 200,
			svgHeight: 100,
			imageType: "png",
			canvasColor: "white",
			backgroundImage,
			exportWithBackgroundImage: true,
		});

		const [strokeImage] = MockImage.instances;
		const serializedSvg = decodeSvgDataUri(strokeImage.src);

		expect(MockImage.instances).toHaveLength(1);
		expect(serializedSvg).toContain(backgroundImage);
		expect(serializedSvg).toContain("__background");
		expect(drawImage).toHaveBeenCalledTimes(1);
		expect(drawImage).toHaveBeenCalledWith(strokeImage, 0, 0, 200, 100);
	});

	it("continues exporting strokes when the background image cannot be loaded", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const backgroundImage = "https://example.com/missing-bg.png";
		MockImage.failingSources.add(backgroundImage);
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = `
			<defs><pattern id="canvas__background"><image href="${backgroundImage}" /></pattern></defs>
			<rect id="canvas__canvas-background" fill="url(#canvas__background)"></rect>
			<g id="canvas__stroke-group-0"></g>
		`;

		await exportImageFromSvg({
			id: "canvas",
			svgCanvas: svg,
			svgWidth: 200,
			svgHeight: 100,
			imageType: "png",
			canvasColor: "white",
			backgroundImage,
			exportWithBackgroundImage: true,
		});

		const [strokeImage] = MockImage.instances;

		expect(warn).toHaveBeenCalledWith(
			"React Sketch Canvas could not load the background image while exporting. Check that backgroundImage points to a reachable image and allows cross-origin access.",
		);
		expect(drawImage).toHaveBeenCalledTimes(1);
		expect(drawImage).toHaveBeenCalledWith(strokeImage, 0, 0, 200, 100);

		warn.mockRestore();
	});
});
