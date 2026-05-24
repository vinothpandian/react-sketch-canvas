import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportImageFromSvg } from "../../../src/Canvas/export/image";

class MockImage {
	static instances: MockImage[] = [];

	static failingSources = new Set<string>();

	static dimensionsBySource = new Map<
		string,
		{ width: number; height: number }
	>();

	public get width() {
		return MockImage.dimensionsBySource.get(this._src)?.width ?? 100;
	}

	public get height() {
		return MockImage.dimensionsBySource.get(this._src)?.height ?? 100;
	}

	public get naturalWidth() {
		return this.width;
	}

	public get naturalHeight() {
		return this.height;
	}

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

function decodeUrlEncodedSvgDataUri(dataUri: string) {
	const [metadata = "", encodedSvg = ""] = dataUri.split(",");

	if (metadata.includes(";base64")) {
		return atob(encodedSvg);
	}

	return decodeURIComponent(encodedSvg);
}

describe("exportImageFromSvg", () => {
	const originalImage = globalThis.Image;
	const originalGetContext = HTMLCanvasElement.prototype.getContext;
	const originalToDataUrl = HTMLCanvasElement.prototype.toDataURL;
	const originalDevicePixelRatio = window.devicePixelRatio;
	const drawImage = vi.fn();
	const fillRect = vi.fn();
	const scale = vi.fn();

	beforeEach(() => {
		MockImage.instances = [];
		MockImage.failingSources = new Set();
		MockImage.dimensionsBySource = new Map();
		drawImage.mockReset();
		fillRect.mockReset();
		scale.mockReset();
		globalThis.Image = MockImage as unknown as typeof Image;
		HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
			drawImage,
			fillRect,
			scale,
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
		Object.defineProperty(window, "devicePixelRatio", {
			configurable: true,
			value: originalDevicePixelRatio,
		});
	});

	it("scales raster export by devicePixelRatio while preserving CSS size", async () => {
		Object.defineProperty(window, "devicePixelRatio", {
			configurable: true,
			value: 2,
		});
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

		await exportImageFromSvg({
			id: "canvas",
			svgCanvas: svg,
			svgWidth: 320,
			svgHeight: 180,
			imageType: "png",
			canvasColor: "white",
			backgroundImage: "",
			exportWithBackgroundImage: false,
		});

		const canvas = vi.mocked(HTMLCanvasElement.prototype.toDataURL).mock
			.contexts[0] as HTMLCanvasElement;

		expect(canvas.width).toBe(640);
		expect(canvas.height).toBe(360);
		expect(canvas.style.width).toBe("320px");
		expect(canvas.style.height).toBe("180px");
		expect(scale).toHaveBeenCalledWith(2, 2);
	});

	it("uses the requested pixel dimensions when options are provided and skips DPR scaling", async () => {
		Object.defineProperty(window, "devicePixelRatio", {
			configurable: true,
			value: 3,
		});
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

		await exportImageFromSvg({
			id: "canvas",
			svgCanvas: svg,
			svgWidth: 320,
			svgHeight: 180,
			imageType: "png",
			canvasColor: "white",
			backgroundImage: "",
			exportWithBackgroundImage: false,
			options: { width: 800, height: 600 },
		});

		const canvas = vi.mocked(HTMLCanvasElement.prototype.toDataURL).mock
			.contexts[0] as HTMLCanvasElement;

		expect(canvas.width).toBe(800);
		expect(canvas.height).toBe(600);
		expect(canvas.style.width).toBe("800px");
		expect(canvas.style.height).toBe("600px");
		expect(scale).not.toHaveBeenCalled();
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

	it("exports data URL background images as a separate raster layer", async () => {
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

		const [strokeImage, backgroundLayer] = MockImage.instances;
		const serializedSvg = decodeSvgDataUri(strokeImage.src);

		expect(MockImage.instances).toHaveLength(2);
		expect(serializedSvg).not.toContain(backgroundImage);
		expect(serializedSvg).not.toContain("__background");
		expect(backgroundLayer.crossOrigin).toBeNull();
		expect(backgroundLayer.src).toBe(backgroundImage);
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

	it("draws raster background images with the configured SVG slice aspect ratio", async () => {
		const backgroundImage = "https://example.com/wide-bg.png";
		MockImage.dimensionsBySource.set(backgroundImage, {
			width: 600,
			height: 400,
		});
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
			preserveBackgroundImageAspectRatio: "xMidYMid slice",
		});

		const [, backgroundLayer] = MockImage.instances;

		expect(drawImage).toHaveBeenNthCalledWith(
			1,
			backgroundLayer,
			0,
			50,
			600,
			300,
			0,
			0,
			200,
			100,
		);
	});

	it("renders SVG data URI backgrounds through the same SVG wrapper as the live canvas", async () => {
		const backgroundImage =
			"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='white'/%3E%3C/svg%3E";
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = `
			<defs><pattern id="canvas__background"><image href="${backgroundImage}" /></pattern></defs>
			<rect id="canvas__canvas-background" fill="url(#canvas__background)"></rect>
			<g id="canvas__stroke-group-0"></g>
		`;
		await exportImageFromSvg({
			id: "canvas",
			svgCanvas: svg,
			svgWidth: 600,
			svgHeight: 240,
			imageType: "png",
			canvasColor: "white",
			backgroundImage,
			exportWithBackgroundImage: true,
			preserveBackgroundImageAspectRatio: "xMidYMid slice",
		});

		const [, backgroundLayer] = MockImage.instances;
		const backgroundSvg = decodeUrlEncodedSvgDataUri(backgroundLayer.src);

		expect(backgroundSvg).toContain('width="600"');
		expect(backgroundSvg).toContain('height="240"');
		expect(backgroundSvg).toContain(backgroundImage);
		expect(backgroundSvg).toContain('preserveAspectRatio="xMidYMid slice"');
		expect(drawImage).toHaveBeenNthCalledWith(
			1,
			backgroundLayer,
			0,
			0,
			600,
			240,
		);
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
