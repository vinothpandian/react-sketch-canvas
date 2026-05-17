import {
	expect,
	type MountOptions,
	test,
} from "@playwright/experimental-ct-react";
import type { Locator } from "playwright/test";
import type { ExportImageType } from "../../src";
import { drawSquares, getCanvasIds } from "../commands";
import { WithExportButton } from "../stories/WithExportButton.story";

test.use({ viewport: { width: 500, height: 500 } });

const canvasId = "rsc";
const exportButtonId = "export-button";
const exportSVGButtonId = "export-svg-button";
const eraserButtonId = "eraser-button";

interface MountCanvasForExportArgs<HooksConfig extends object> {
	mount: (
		component: React.ReactElement,
		options?: MountOptions<HooksConfig>,
	) => Promise<Locator>;
	imageType?: ExportImageType;
	handleExport?: (size: number) => void;
	handleExportImage?: (dataURI: string | undefined) => void;
	backgroundUrl?: string;
	exportWithBackgroundImage?: boolean;
	handleExportSVG?: (svg: string | undefined) => void;
}

async function mountCanvasForExport<HooksConfig extends object>({
	mount,
	imageType,
	handleExport,
	handleExportImage,
	backgroundUrl,
	exportWithBackgroundImage,
	handleExportSVG,
}: MountCanvasForExportArgs<HooksConfig>) {
	const component = await mount(
		<WithExportButton
			id={canvasId}
			imageType={imageType ?? "png"}
			eraserButtonId={eraserButtonId}
			exportButtonId={exportButtonId}
			exportSVGButtonId={exportSVGButtonId}
			onExport={handleExport}
			onExportImage={handleExportImage}
			backgroundImage={backgroundUrl}
			exportWithBackgroundImage={exportWithBackgroundImage}
			onExportSVG={handleExportSVG}
		/>,
	);

	const canvas = component.locator(`#${canvasId}`);

	const exportButton = component.locator(`#${exportButtonId}`);

	const eraserButton = component.locator(`#${eraserButtonId}`);

	const exportSVGButton = component.locator(`#${exportSVGButtonId}`);

	return { canvas, exportButton, eraserButton, exportSVGButton };
}

const expectedStrokeCount = 3;

function dataURIPattern(imageType: ExportImageType) {
	return new RegExp(`^data:image/${imageType};base64,`);
}

function exportedIdFragment(idOrSelector: string) {
	return idOrSelector.replace(/^#?[^_]+__/, "");
}

function expectValidDataURI(
	dataURI: string | undefined,
	imageType: ExportImageType,
) {
	expect(dataURI).toMatch(dataURIPattern(imageType));
	expect(dataURI?.split("base64,")[1]?.length).toBeGreaterThan(0);
}

async function exportImageAndWait(
	exportButton: Locator,
	getDataURI: () => string | undefined,
	imageType: ExportImageType,
) {
	await exportButton.click();
	await expect
		.poll(() => getDataURI() ?? "")
		.toMatch(dataURIPattern(imageType));
	expectValidDataURI(getDataURI(), imageType);
}

async function drawSquaresAndWaitForStroke(canvas: Locator) {
	await drawSquares(canvas);
	await expect(canvas.locator("path")).toHaveCount(expectedStrokeCount);
}

async function drawSquaresAndWaitForEraser(canvas: Locator) {
	const { firstEraserStrokeId, firstEraserMask } = getCanvasIds(canvasId);

	await drawSquares(canvas);
	await expect(canvas.locator(firstEraserStrokeId)).toHaveCount(1);
	await expect(canvas.locator(firstEraserMask)).toHaveCount(1);
}

const backgroundUrl =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='white'/%3E%3Ccircle cx='300' cy='200' r='120' fill='black'/%3E%3C/svg%3E";
test.describe("exportImage", () => {
	for (const imageType of ["png", "jpeg"] as const) {
		test.describe(`exportImage - ${imageType}`, () => {
			test.describe("without background image", () => {
				test(`should export ${imageType} with stroke`, async ({ mount }) => {
					let size = 0;
					let dataURI: string | undefined;
					const handleExport = (kbs: number) => {
						size = kbs;
					};
					const handleExportImage = (exportedDataURI: string | undefined) => {
						dataURI = exportedDataURI;
					};

					const { canvas, exportButton } = await mountCanvasForExport({
						mount,
						imageType,
						handleExport,
						handleExportImage,
					});

					await exportImageAndWait(exportButton, () => dataURI, imageType);

					await drawSquaresAndWaitForStroke(canvas);

					await exportImageAndWait(exportButton, () => dataURI, imageType);
					expect(size).toBeGreaterThan(0);
				});

				test(`should export ${imageType} with stroke and eraser`, async ({
					mount,
				}) => {
					let size = 0;
					let dataURI: string | undefined;
					const handleExport = (kbs: number) => {
						size = kbs;
					};
					const handleExportImage = (exportedDataURI: string | undefined) => {
						dataURI = exportedDataURI;
					};

					const { canvas, exportButton, eraserButton } =
						await mountCanvasForExport({
							mount,
							imageType,
							handleExport,
							handleExportImage,
						});

					await exportImageAndWait(exportButton, () => dataURI, imageType);

					await drawSquaresAndWaitForStroke(canvas);

					await exportImageAndWait(exportButton, () => dataURI, imageType);
					expect(size).toBeGreaterThan(0);

					await eraserButton.click();
					await drawSquaresAndWaitForEraser(canvas);

					await exportImageAndWait(exportButton, () => dataURI, imageType);
					expect(size).toBeGreaterThan(0);
				});
			});

			test.describe("with background image", () => {
				test(`should export ${imageType} with stroke`, async ({ mount }) => {
					let size = 0;
					let dataURI: string | undefined;
					const handleExport = (kbs: number) => {
						size = kbs;
					};
					const handleExportImage = (exportedDataURI: string | undefined) => {
						dataURI = exportedDataURI;
					};

					const { canvas, exportButton } = await mountCanvasForExport({
						mount,
						imageType,
						handleExport,
						handleExportImage,
						backgroundUrl,
						exportWithBackgroundImage: true,
					});

					await exportImageAndWait(exportButton, () => dataURI, imageType);

					await drawSquaresAndWaitForStroke(canvas);

					await exportImageAndWait(exportButton, () => dataURI, imageType);
					expect(size).toBeGreaterThan(0);
				});

				test(`should export ${imageType} with stroke and eraser`, async ({
					mount,
				}) => {
					let size = 0;
					let dataURI: string | undefined;
					const handleExport = (kbs: number) => {
						size = kbs;
					};
					const handleExportImage = (exportedDataURI: string | undefined) => {
						dataURI = exportedDataURI;
					};

					const { canvas, exportButton, eraserButton } =
						await mountCanvasForExport({
							mount,
							imageType,
							handleExport,
							handleExportImage,
							backgroundUrl,
							exportWithBackgroundImage: true,
						});

					await exportImageAndWait(exportButton, () => dataURI, imageType);

					await drawSquaresAndWaitForStroke(canvas);

					await exportImageAndWait(exportButton, () => dataURI, imageType);
					expect(size).toBeGreaterThan(0);

					await eraserButton.click();
					await drawSquaresAndWaitForEraser(canvas);

					await exportImageAndWait(exportButton, () => dataURI, imageType);
					expect(size).toBeGreaterThan(0);
				});
			});

			test.describe("with background image, but exportWithBackgroundImage is set false", () => {
				test(`should export ${imageType} with stroke`, async ({ mount }) => {
					let size = 0;
					let dataURI: string | undefined;
					const handleExport = (kbs: number) => {
						size = kbs;
					};
					const handleExportImage = (exportedDataURI: string | undefined) => {
						dataURI = exportedDataURI;
					};

					const { canvas, exportButton } = await mountCanvasForExport({
						mount,
						imageType,
						handleExport,
						handleExportImage,
						backgroundUrl,
						exportWithBackgroundImage: false,
					});

					await exportImageAndWait(exportButton, () => dataURI, imageType);

					await drawSquaresAndWaitForStroke(canvas);

					await exportImageAndWait(exportButton, () => dataURI, imageType);
					expect(size).toBeGreaterThan(0);
				});

				test(`should export ${imageType} with stroke and eraser`, async ({
					mount,
				}) => {
					let size = 0;
					let dataURI: string | undefined;
					const handleExport = (kbs: number) => {
						size = kbs;
					};
					const handleExportImage = (exportedDataURI: string | undefined) => {
						dataURI = exportedDataURI;
					};

					const { canvas, exportButton, eraserButton } =
						await mountCanvasForExport({
							mount,
							imageType,
							handleExport,
							handleExportImage,
							backgroundUrl,
							exportWithBackgroundImage: false,
						});

					await exportImageAndWait(exportButton, () => dataURI, imageType);

					await drawSquaresAndWaitForStroke(canvas);

					await exportImageAndWait(exportButton, () => dataURI, imageType);
					expect(size).toBeGreaterThan(0);

					await eraserButton.click();
					await drawSquaresAndWaitForEraser(canvas);

					await exportImageAndWait(exportButton, () => dataURI, imageType);
					expect(size).toBeGreaterThan(0);
				});
			});
		});
	}
});

test.describe("export SVG", () => {
	test.describe("without background image", () => {
		test("should export svg with stroke", async ({ mount }) => {
			let svg: string | undefined;
			const handleExportSVG = (exportedSvg: string | undefined) => {
				svg = exportedSvg;
			};

			const { canvas, exportSVGButton } = await mountCanvasForExport({
				mount,
				handleExportSVG,
			});

			const { firstStrokePathId } = getCanvasIds(canvasId);

			await exportSVGButton.click();
			expect(svg).not.toContain(firstStrokePathId.slice(1));

			await drawSquaresAndWaitForStroke(canvas);

			await exportSVGButton.click();
			expect(svg).toContain(exportedIdFragment(firstStrokePathId));
		});

		test("should export svg with stroke and eraser", async ({ mount }) => {
			let svg: string | undefined;
			const handleExportSVG = (exportedSvg: string | undefined) => {
				svg = exportedSvg;
			};

			const { canvas, exportSVGButton, eraserButton } =
				await mountCanvasForExport({
					mount,
					handleExportSVG,
				});

			const { firstStrokePathId, firstEraserStrokeId } = getCanvasIds(canvasId);

			await exportSVGButton.click();
			expect(svg).not.toContain(firstStrokePathId.slice(1));
			expect(svg).not.toContain(firstEraserStrokeId.slice(1));

			await drawSquaresAndWaitForStroke(canvas);

			await exportSVGButton.click();
			expect(svg).toContain(exportedIdFragment(firstStrokePathId));
			expect(svg).not.toContain(exportedIdFragment(firstEraserStrokeId));

			await eraserButton.click();
			await drawSquaresAndWaitForEraser(canvas);

			await exportSVGButton.click();
			expect(svg).toContain(exportedIdFragment(firstEraserStrokeId));
		});
	});

	test.describe("with background image", () => {
		test("should export svg with stroke", async ({ mount }) => {
			let svg: string | undefined;
			const handleExportSVG = (exportedSvg: string | undefined) => {
				svg = exportedSvg;
			};

			const { canvas, exportSVGButton } = await mountCanvasForExport({
				mount,
				handleExportSVG,
				backgroundUrl,
				exportWithBackgroundImage: true,
			});

			const { canvasBackgroundId, firstStrokePathId } = getCanvasIds(canvasId);

			await exportSVGButton.click();
			expect(svg).toContain(backgroundUrl);
			expect(svg).toContain(exportedIdFragment(canvasBackgroundId));
			expect(svg).not.toContain(firstStrokePathId.slice(1));

			await drawSquaresAndWaitForStroke(canvas);

			await exportSVGButton.click();
			expect(svg).toContain(backgroundUrl);
			expect(svg).toContain(exportedIdFragment(canvasBackgroundId));
			expect(svg).toContain(exportedIdFragment(firstStrokePathId));
		});

		test("should export svg with stroke and eraser", async ({ mount }) => {
			let svg: string | undefined;
			const handleExportSVG = (exportedSvg: string | undefined) => {
				svg = exportedSvg;
			};

			const { canvas, exportSVGButton, eraserButton } =
				await mountCanvasForExport({
					mount,
					handleExportSVG,
					backgroundUrl,
					exportWithBackgroundImage: true,
				});

			const { canvasBackgroundId, firstStrokePathId, firstEraserStrokeId } =
				getCanvasIds(canvasId);

			await exportSVGButton.click();
			expect(svg).toContain(backgroundUrl);
			expect(svg).toContain(exportedIdFragment(canvasBackgroundId));
			expect(svg).not.toContain(firstStrokePathId.slice(1));
			expect(svg).not.toContain(firstEraserStrokeId.slice(1));

			await drawSquaresAndWaitForStroke(canvas);

			await exportSVGButton.click();
			expect(svg).toContain(backgroundUrl);
			expect(svg).toContain(exportedIdFragment(canvasBackgroundId));
			expect(svg).toContain(exportedIdFragment(firstStrokePathId));
			expect(svg).not.toContain(firstEraserStrokeId.slice(1));

			await eraserButton.click();
			await drawSquaresAndWaitForEraser(canvas);

			await exportSVGButton.click();
			expect(svg).toContain(backgroundUrl);
			expect(svg).toContain(exportedIdFragment(canvasBackgroundId));
			expect(svg).toContain(exportedIdFragment(firstEraserStrokeId));
		});
	});

	test.describe("with background image, but exportWithBackgroundImage is set false", () => {
		test("should export svg with stroke", async ({ mount }) => {
			let svg: string | undefined;
			const handleExportSVG = (exportedSvg: string | undefined) => {
				svg = exportedSvg;
			};

			const { canvas, exportSVGButton } = await mountCanvasForExport({
				mount,
				handleExportSVG,
				backgroundUrl,
				exportWithBackgroundImage: false,
			});

			const { canvasBackgroundId, firstStrokePathId } = getCanvasIds(canvasId);

			await exportSVGButton.click();
			expect(svg).not.toContain(backgroundUrl);
			expect(svg).not.toContain(firstStrokePathId.slice(1));

			await drawSquaresAndWaitForStroke(canvas);

			await exportSVGButton.click();
			expect(svg).not.toContain(backgroundUrl);
			expect(svg).toContain(exportedIdFragment(canvasBackgroundId));
			expect(svg).toContain(exportedIdFragment(firstStrokePathId));
		});

		test("should export svg with stroke and eraser", async ({ mount }) => {
			let svg: string | undefined;
			const handleExportSVG = (exportedSvg: string | undefined) => {
				svg = exportedSvg;
			};

			const { canvas, exportSVGButton, eraserButton } =
				await mountCanvasForExport({
					mount,
					handleExportSVG,
					backgroundUrl,
					exportWithBackgroundImage: false,
				});

			const { canvasBackgroundId, firstStrokePathId, firstEraserStrokeId } =
				getCanvasIds(canvasId);

			await exportSVGButton.click();
			expect(svg).not.toContain(backgroundUrl);
			expect(svg).toContain(exportedIdFragment(canvasBackgroundId));
			expect(svg).not.toContain(firstStrokePathId.slice(1));
			expect(svg).not.toContain(firstEraserStrokeId.slice(1));

			await drawSquaresAndWaitForStroke(canvas);

			await exportSVGButton.click();
			expect(svg).not.toContain(backgroundUrl);
			expect(svg).toContain(exportedIdFragment(canvasBackgroundId));
			expect(svg).toContain(exportedIdFragment(firstStrokePathId));
			expect(svg).not.toContain(firstEraserStrokeId.slice(1));

			await eraserButton.click();
			await drawSquaresAndWaitForEraser(canvas);

			await exportSVGButton.click();
			expect(svg).not.toContain(backgroundUrl);
			expect(svg).toContain(exportedIdFragment(canvasBackgroundId));
			expect(svg).toContain(exportedIdFragment(firstEraserStrokeId));
		});
	});
});
